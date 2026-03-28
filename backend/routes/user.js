import bcrypt from "bcrypt";
import express from "express";

import { pool } from "../connection/database.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { requireRole } from "../middleware/requireRole.js";
import { isEmail, normalizeEmail } from "../utils/normalizeDatabese.js";
import { hashPassword } from "../utils/operateAuth.js";
import { toArray } from "../utils/query.js";

const router = express.Router();

// ユーザの登録
router.post("/v1/register", async (req, res) => {
  console.log("/user/v1/register");
  const client = await pool.connect();
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "名前, メールアドレス, パスワード, ロール は必須です。",
        data: null,
      });
    }

    const normalizedEmail = normalizeEmail(email);

    if (password.length < 8) {
      return res.status(400).json({
        message: "パスワード は8文字以上で入力してください。",
      });
    }

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
          "このメールアドレスは仮登録済みです。認証メールを再送してください。",
        data: null,
      });
    }

    const passwordHash = await hashPassword(password);

    const result = await pool.query(
      `
      INSERT INTO
        users (
          name,
          email,
          password_hash,
          role,
          is_verified
        )
        VALUES (
          $1, $2, $3, $4, true
        )
      `,
      [name.trim(), normalizedEmail, passwordHash, role],
    );

    return res.status(201).json({
      success: true,
      message: "ユーザを登録しました。",
      data: {
        user: result.rows[0],
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "ユーザを登録できませんでした。管理者に問い合わせしてください。",
      data: null,
    });
  }
});

// ユーザの取得
router.get("/v1/retrieve", authenticateToken, async (req, res) => {
  console.log("/user/v1/retrieve");

  const client = await pool.connect();

  try {
    // パラメータの取得
    const { search, id, role } = req.query;
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit ?? "20", 10), 1),
      100,
    );
    const offset = (page - 1) * limit;

    const { name, email } = (() => {
      if (isEmail(search)) {
        return { name: null, email: search };
      } else {
        return { name: search, email: null };
      }
    })();

    const roles = toArray(role);

    const values = [];
    const whereClauses = [];

    if (id) {
      values.push(id);
      whereClauses.push(`u.id = $${values.length}`);
    }

    if (name) {
      values.push(`%${name}%`);
      whereClauses.push(`u.name ILIKE $${values.length}`);
    }

    if (email) {
      values.push(email);
      whereClauses.push(`u.email = $${values.length}`);
    }

    if (roles.length) {
      values.push(roles);
      whereClauses.push(`u.role = ANY($${values.length})`);
    }

    // 申請を取得(全件数)
    const totalSql = `
      SELECT
        COUNT(*)
      FROM
        users u
      ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""}
      ;
    `;
    const totalResult = await client.query(totalSql, values);
    const total = parseInt(totalResult.rows[0].count, 10);
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    if (total === 0) {
      return res.status(404).json({
        success: false,
        message: "ユーザが見つかりませんでした。",
        data: {
          users: [],
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      });
    }

    // 申請を取得(検索)
    values.push(limit);
    const limitClause = `$${values.length}`;

    values.push(offset);
    const offsetClause = `$${values.length}`;

    const searchSql = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role
      FROM
        users u
      ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""}
      ORDER BY
        u.name DESC
      LIMIT ${limitClause} OFFSET ${offsetClause}
      ;
    `;
    const searchResult = await client.query(searchSql, values);
    const users = searchResult.rows;

    // 結果返却
    return res.status(200).json({
      success: true,
      message: "ユーザ一覧を取得しました。",
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "ユーザを取得できませんでした。管理者に問い合わせしてください。",
      data: null,
    });
  } finally {
    client.release();
  }
});

// ログインユーザのプロフィール更新
router.put("/v1/update/me", authenticateToken, async (req, res) => {
  console.log("/user/v1/update/me");
  const client = await pool.connect();
  try {
    const { name, email } = req.body;
    if (name === undefined && email === undefined) {
      return res.status(400).json({
        success: false,
        message: "更新内容がありません。",
        data: null,
      });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "名前は必須です。",
          data: null,
        });
      }
      updates.push(`name = $${values.length + 1}`);
      values.push(trimmedName);
    }

    if (email !== undefined) {
      const trimmedEmail = String(email).trim();
      if (!trimmedEmail) {
        return res.status(400).json({
          success: false,
          message: "メールアドレスは必須です。",
          data: null,
        });
      }
      const exists = await client.query(
        `
        SELECT
          id
        FROM
          users
        WHERE
          email = $1
        `,
        [trimmedEmail],
      );
      if (exists.rows[0] && exists.rows[0].id !== req.user.id) {
        return res.status(400).json({
          success: false,
          message: "既に使用されているメールアドレスです。",
          data: null,
        });
      }
      updates.push(`email = $${values.length + 1}`);
      values.push(trimmedEmail);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "更新内容がありません。",
        data: null,
      });
    }

    values.push(req.user.id);

    await client.query("BEGIN");
    const result = await client.query(
      `
      UPDATE users SET
        ${updates.join(", ")},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length}
      RETURNING id, name, email, role
      `,
      values,
    );
    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "ユーザ情報を更新しました。",
      data: { user: result.rows[0] },
    });
  } catch (e) {
    await client.query("ROLLBACK");
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "更新に失敗しました。管理者に問い合わせしてください。",
      data: null,
    });
  } finally {
    client.release();
  }
});

// ログインユーザのパスワード更新
router.put("/v1/update/password", authenticateToken, async (req, res) => {
  console.log("/user/v1/update/password");
  const client = await pool.connect();
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "パスワードを入力してください。",
        data: null,
      });
    }

    const user = await client.query(
      `SELECT password_hash FROM users WHERE id = $1`,
      [req.user.id],
    );
    if (!user.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "ユーザが見つかりません。",
        data: null,
      });
    }

    const isValid = await bcrypt.compare(
      currentPassword,
      user.rows[0].password_hash,
    );
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "既存のパスワードが一致しません。",
        data: null,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "パスワードは確認用と一致するようにしてください。",
        data: null,
      });
    }

    const passwordHash = await hashPassword(newPassword);

    await client.query("BEGIN");
    await client.query(
      `
      UPDATE users SET
        password_hash = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [passwordHash, req.user.id],
    );
    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "パスワードを更新しました。",
      data: null,
    });
  } catch (e) {
    await client.query("ROLLBACK");
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "更新に失敗しました。管理者に問い合わせしてください。",
      data: null,
    });
  } finally {
    client.release();
  }
});

// ユーザの更新
router.put(
  "/v1/update/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    console.log("/user/v1/update");
    const client = await pool.connect();
    try {
      // パラメータの取得
      const userId = req.params.id;
      const { role } = req.body;

      if (userId === req.user.id) {
        return res.status(400).json({
          success: false,
          message:
            "本人の権限は変更できません。他管理ユーザに依頼してください。",
          data: null,
        });
      }
      await client.query("BEGIN");

      await client.query(
        `
        UPDATE
          users
        SET
          role = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE
          id = $2
        `,
        [role, userId],
      );

      await client.query("COMMIT");
      return res.status(200).json({
        success: true,
        message: "ユーザを更新しました。",
        data: { userId },
      });
    } catch (e) {
      await client.query("ROLLBACK");
      console.log(e);
      return res.status(500).json({
        success: false,
        message: "更新に失敗しました。管理者に問い合わせしてください。",
        data: null,
      });
    } finally {
      client.release();
    }
  },
);

// ユーザの削除
router.delete(
  "/v1/delete/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    console.log("/user/v1/delete");
    const client = await pool.connect();
    try {
      // パラメータの取得
      const userId = req.params.id;

      if (userId === req.user.id) {
        return res.status(400).json({
          success: false,
          message: "本人は削除できません。他管理ユーザに依頼してください。",
          data: null,
        });
      }

      await client.query("BEGIN");

      await client.query(
        `
        DELETE
        FROM
          users
        WHERE
          id = $1
        `,
        [userId],
      );

      await client.query("COMMIT");
      return res.status(200).json({
        success: true,
        message: "ユーザを削除しました。",
        data: { userId },
      });
    } catch (e) {
      await client.query("ROLLBACK");
      console.log(e);
      return res.status(500).json({
        success: false,
        message: "削除に失敗しました。管理者に問い合わせしてください。",
        data: null,
      });
    } finally {
      client.release();
    }
  },
);

export default router;
