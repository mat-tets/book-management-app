import express from "express";

import { pool } from "../connection/database.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { normalizeEmail } from "../utils/normalizeDatabese.js";
import {
  confirmPassword,
  hashPassword,
  signAccessToken,
} from "../utils/operateAuth.js";
import {
  PASSWORD_RESET_EXPIRES_HOURS,
  VERIFICATION_EXPIRES_HOURS,
  generateVerificationToken,
  hashToken,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../utils/operateMail.js";

const router = express.Router();

// ユーザのサインアップ
router.post("/v1/signup", async (req, res) => {
  console.log("/auth/v1/singup");
  const client = await pool.connect();

  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "名前, メールアドレス, パスワードは必須です。",
        data: null,
      });
    }

    const normalizedEmail = normalizeEmail(email);

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "パスワードは8文字以上で入力してください。",
        data: null,
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "パスワードは確認用と一致するようにしてください。",
        data: null,
      });
    }

    // クエリの開始
    await client.query("BEGIN");

    const existingUserResult = await client.query(
      `
      SELECT
        id,
        email,
        is_verified
      FROM
        users
      WHERE
        email = $1
      LIMIT 1
      ;
      `,
      [normalizedEmail],
    );

    if (existingUserResult.rows.length > 0) {
      const existingUser = existingUserResult.rows[0];

      if (existingUser.is_verified) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          success: false,
          message: "このメールアドレスは既に登録済みです。",
          data: null,
        });
      }

      await client.query("ROLLBACK");
      return res.status(409).json({
        success: false,
        message:
          "このメールアドレスは仮登録済みです。認証メールを確認してください。",
        data: null,
      });
    }

    const passwordHash = await hashPassword(password);

    const insertedUserResult = await client.query(
      `
      INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        is_verified
      )
      VALUES (
        $1,
        $2,
        $3,
        'general',
        false
      )
      RETURNING
        id,
        name,
        email
      ;
      `,
      [name.trim(), normalizedEmail, passwordHash],
    );

    const user = insertedUserResult.rows[0];

    const token = generateVerificationToken();
    const tokenHash = hashToken(token);

    const expiresAtResult = await client.query(
      `
      SELECT
        CURRENT_TIMESTAMP + ($1 || ' hours')::interval AS expires_at
      ;
      `,
      [VERIFICATION_EXPIRES_HOURS],
    );

    const expiresAt = expiresAtResult.rows[0].expires_at;

    await client.query(
      `
      INSERT INTO email_verifications (
        user_id,
        token_hash,
        expires_at
      )
      VALUES (
        $1,
        $2,
        $3
      )
      ;
      `,
      [user.id, tokenHash, expiresAt],
    );

    // クエリの終了
    await client.query("COMMIT");

    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        token,
      });
    } catch (mailError) {
      console.log("failed to send verification email:", mailError);
      return res.status(201).json({
        success: true,
        message:
          "仮登録は完了しましたが、認証メールの送信に失敗しました。再送をお願いします。",
        data: null,
      });
    }

    return res.status(201).json({
      success: true,
      message: "仮登録が完了しました。認証メールから本登録をお願いします。",
      data: null,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({
      success: false,
      message: "登録に失敗しました。管理者に問い合わせしてください。",
      data: null,
    });
  } finally {
    client.release();
  }
});

// 認証メールの確認
router.post("/v1/verify-email", async (req, res) => {
  console.log("/auth/v1/verify-email");
  const client = await pool.connect();

  try {
    const token = req.body.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "token が必要です。",
        data: null,
      });
    }

    const tokenHash = hashToken(String(token));

    // クエリの開始
    await client.query("BEGIN");

    const verificationResult = await client.query(
      `
      SELECT
        ev.id,
        ev.user_id,
        ev.expires_at,
        u.is_verified
      FROM
        email_verifications ev
      INNER JOIN users u
        ON u.id = ev.user_id
      WHERE
        ev.token_hash = $1
      LIMIT 1
      ;
      `,
      [tokenHash],
    );

    if (verificationResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "無効な認証リンクです。",
        data: null,
      });
    }

    const verification = verificationResult.rows[0];

    if (verification.is_verified) {
      await client.query(
        `
        DELETE FROM email_verifications
        WHERE user_id = $1
        ;
        `,
        [verification.user_id],
      );
      await client.query("COMMIT");

      return res.status(409).json({
        success: false,
        message: "すでに認証済みです。",
        data: null,
      });
    }

    const nowResult = await client.query(
      `
      SELECT CURRENT_TIMESTAMP AS now
      ;
      `,
    );
    const now = nowResult.rows[0].now;

    if (new Date(now) > new Date(verification.expires_at)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "認証リンクの有効期限が切れています。",
        data: null,
      });
    }

    await client.query(
      `
      UPDATE users
      SET
        is_verified = true,
        updated_at = CURRENT_TIMESTAMP
      WHERE
        id = $1
      ;
      `,
      [verification.user_id],
    );

    await client.query(
      `
      DELETE FROM email_verifications
      WHERE user_id = $1
      ;
      `,
      [verification.user_id],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "メール認証が完了しました。アプリケーションをご利用ください。",
      data: null,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({
      success: false,
      message: "認証に失敗しました。管理者に問い合わせしてください。",
      data: null,
    });
  } finally {
    client.release();
  }
});

// 認証メールの再送
router.post("/v1/resend-verification", async (req, res) => {
  console.log("/auth/v1/resend-verification");
  const client = await pool.connect();

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email は必須です。",
        data: null,
      });
    }

    const normalizedEmail = normalizeEmail(email);

    await client.query("BEGIN");

    const userResult = await client.query(
      `
      SELECT
        id,
        name,
        email,
        is_verified
      FROM
        users
      WHERE
        email = $1
      LIMIT 1
      ;
      `,
      [normalizedEmail],
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "該当ユーザーが見つかりません。",
        data: null,
      });
    }

    const user = userResult.rows[0];

    if (user.is_verified) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "このユーザーはすでに認証済みです。",
        data: null,
      });
    }

    await client.query(
      `
      DELETE
      FROM
        email_verifications
      WHERE
        user_id = $1
      ;
      `,
      [user.id],
    );

    const token = generateVerificationToken();
    const tokenHash = hashToken(token);

    const expiresAtResult = await client.query(
      `
      SELECT
        CURRENT_TIMESTAMP + ($1 || ' hours')::interval AS expires_at
      ;
      `,
      [VERIFICATION_EXPIRES_HOURS],
    );

    const expiresAt = expiresAtResult.rows[0].expires_at;

    await client.query(
      `
      INSERT INTO email_verifications (
        user_id,
        token_hash,
        expires_at
      )
      VALUES (
        $1,
        $2,
        $3
      )
      ;
      `,
      [user.id, tokenHash, expiresAt],
    );

    await client.query("COMMIT");

    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        token,
      });
    } catch (mailError) {
      console.log("failed to resend verification email:", mailError);
      return res.status(500).json({
        success: false,
        message: "認証メールの再送に失敗しました。",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "認証メールを再送しました。",
      data: null,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({
      success: false,
      message: "認証メールの再送に失敗しました 管理者に問い合わせしてください",
      data: null,
    });
  } finally {
    client.release();
  }
});

// パスワードの再設定
router.post("/v1/forgot-password", async (req, res) => {
  console.log("/auth/v1/forgot-password");
  const client = await pool.connect();

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "メールアドレスは必須です。",
        data: null,
      });
    }

    const normalizedEmail = normalizeEmail(email);

    await client.query("BEGIN");

    const userResult = await client.query(
      `
      SELECT
        id,
        name,
        email,
        is_verified,
        role
      FROM
        users
      WHERE
        email = $1
      LIMIT 1
      ;
      `,
      [normalizedEmail],
    );

    // ユーザが存在しない場合
    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(200).json({
        success: true,
        message:
          "該当するアカウントが存在する場合、パスワード再設定メールを送信しました。",
        data: null,
      });
    }

    const user = userResult.rows[0];

    // ユーザが有効でない場合
    if (!user.is_verified || user.role === "lock") {
      await client.query("ROLLBACK");
      return res.status(200).json({
        success: true,
        message:
          "該当するアカウントが存在する場合、パスワード再設定メールを送信しました。",
        data: null,
      });
    }

    await client.query(
      `
      DELETE
      FROM
        password_resets
      WHERE
        user_id = $1
      ;
      `,
      [user.id],
    );

    const token = generateVerificationToken();
    const tokenHash = hashToken(token);

    const expiresAtResult = await client.query(
      `
      SELECT
        CURRENT_TIMESTAMP + ($1 || ' hours')::interval AS expires_at
      ;
      `,
      [PASSWORD_RESET_EXPIRES_HOURS],
    );

    const expiresAt = expiresAtResult.rows[0].expires_at;

    await client.query(
      `
      INSERT INTO password_resets (
        user_id,
        token_hash,
        expires_at
      )
      VALUES (
        $1,
        $2,
        $3
      )
      ;
      `,
      [user.id, tokenHash, expiresAt],
    );

    await client.query("COMMIT");

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        token,
      });
    } catch (mailError) {
      console.log("failed to send password reset email:", mailError);
    }

    return res.status(200).json({
      success: true,
      message:
        "該当するアカウントが存在する場合、パスワード再設定メールを送信しました。",
      data: null,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({
      success: false,
      message:
        "パスワードの再設定に失敗しました 管理者に問い合わせしてください",
      data: null,
    });
  } finally {
    client.release();
  }
});

// パスワードのリセット
router.post("/v1/reset-password", async (req, res) => {
  console.log("/auth/v1/reset-password");
  const client = await pool.connect();

  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "token, パスワード は必須です。",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "パスワード は8文字以上で入力してください。",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "パスワードは確認用と一致するようにしてください。",
        data: null,
      });
    }

    const tokenHash = hashToken(String(token));

    await client.query("BEGIN");

    const resetResult = await client.query(
      `
      SELECT
        pr.id,
        pr.user_id,
        pr.expires_at,
        u.role
      FROM
        password_resets pr
      INNER JOIN users u
        ON u.id = pr.user_id
      WHERE
        pr.token_hash = $1
      LIMIT 1
      ;
      `,
      [tokenHash],
    );

    if (resetResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "無効な再設定リンクです。",
        data: null,
      });
    }

    const reset = resetResult.rows[0];

    if (reset.role === "lock") {
      await client.query("ROLLBACK");
      return res.status(403).json({
        success: false,
        message: "このアカウントはロックされています。",
        data: null,
      });
    }

    const nowResult = await client.query(
      `
      SELECT CURRENT_TIMESTAMP AS now
      ;
      `,
    );
    const now = nowResult.rows[0].now;

    if (new Date(now) > new Date(reset.expires_at)) {
      await client.query(
        `
        DELETE FROM password_resets
        WHERE user_id = $1
        ;
        `,
        [reset.user_id],
      );

      await client.query("COMMIT");

      return res.status(400).json({
        success: false,
        message: "再設定リンクの有効期限が切れています。",
        data: null,
      });
    }

    const passwordHash = await hashPassword(password);

    await client.query(
      `
      UPDATE users
      SET
        password_hash = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE
        id = $2
      ;
      `,
      [passwordHash, reset.user_id],
    );

    await client.query(
      `
      DELETE FROM password_resets
      WHERE user_id = $1
      ;
      `,
      [reset.user_id],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "パスワードを再設定しました。",
      data: null,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({
      success: false,
      message:
        "パスワードのリセットに失敗しました 管理者に問い合わせしてください",
      data: null,
    });
  } finally {
    client.release();
  }
});

// ユーザのサインイン
router.post("/v1/signin", async (req, res) => {
  console.log("/auth/v1/singin");

  const client = await pool.connect();

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "メールアドレス, パスワードは必須です。",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const userResult = await client.query(
      `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        is_verified
      FROM
        users
      WHERE
        email = $1
      LIMIT 1
      ;
      `,
      [normalizedEmail],
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        message: "メールアドレスまたはパスワードが正しくありません。",
      });
    }

    const user = userResult.rows[0];

    const isMatched = await confirmPassword(password, user.password_hash);

    if (!isMatched) {
      return res.status(401).json({
        success: false,
        message: "メールアドレスまたはパスワードが正しくありません。",
        data: null,
      });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: "メール認証が完了していません。",
        data: null,
      });
    }

    if (user.role === "lock") {
      return res.status(403).json({
        success: false,
        message: "このアカウントはロックされています。",
        data: null,
      });
    }

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    await client.query(
      `
      INSERT INTO
        login_logs (
          user_id,
          ip_address
        )
      VALUES (
        $1, $2
      )
      `,
      [user.id, req.ip],
    );

    return res.status(200).json({
      success: true,
      message: "ログインに成功しました。",
      data: {
        token: accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "サインインに失敗しました 管理者に問い合わせしてください",
      data: null,
    });
  } finally {
    client.release();
  }
});

// ユーザのトークン認証
router.get("/v1/me", authenticateToken, async (req, res) => {
  console.log("/user/v1/me");
  try {
    const user = await pool.query(
      `SELECT id, name, email, role FROM users WHERE id = $1`,
      [req.user.id],
    );
    return res.status(200).json({
      success: true,
      message: "トークン認証に成功しました",
      data: {
        user: user.rows[0],
      },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "認証に失敗しました 管理者に問い合わせしてください",
      data: null,
    });
  }
});

export default router;
