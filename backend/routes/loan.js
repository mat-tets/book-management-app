import camelcaseKeys from "camelcase-keys";
import express from "express";

import { pool } from "../connection/database.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  sendRegisterApplication,
  sendUpdateApplication,
  sendUpdateApproval,
} from "../utils/operateMail.js";

const router = express.Router();

// 申請の登録
router.post("/v1/application/register", authenticateToken, async (req, res) => {
  console.log("/loan/v1/application/register");

  const client = await pool.connect();

  try {
    // パラメータの取得
    const { bookId, approverId } = req.body;
    const userId = req.user.id;

    // 重複して申請していないか確認
    const existingApplicationResult = await client.query(
      `
      SELECT
        *
      FROM
        loan_histories
      WHERE
        user_id = $1
        AND book_id = $2
        AND (
          status = 'pending'
          OR status = 'approved'
          OR status = 'return_pending'
        )
      LIMIT 1
      ;
      `,
      [userId, bookId],
    );

    if (existingApplicationResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "すでに申請済みです。",
        data: null,
      });
    }

    // クエリの開始
    await client.query("BEGIN");

    // 貸出可能か最終確認
    const existingStock = await client.query(
      `
      SELECT
        *
      FROM (
        SELECT
          b.id,
          b.stock_count - COUNT(lh.id) FILTER (
            WHERE
              lh.status = 'approved'
              OR lh.status = 'return_pending'
          ) AS available
        FROM
          books b
        LEFT JOIN
          loan_histories lh
            ON lh.book_id = b.id
        WHERE
          b.id = $1
        GROUP BY b.id
      ) sub
      WHERE
        available > 0
      LIMIT
        1
      ;
      `,
      [bookId],
    );
    if (existingStock.rows.length <= 0) {
      return res.status(404).json({
        success: false,
        message: "貸出可能な本がありませんでした。",
        data: null,
      });
    }

    // 貸出申請の登録
    const insertApplicationResult = await client.query(
      `
      INSERT INTO
        loan_histories (
          user_id,
          book_id,
          status,
          approved_by
        )
      VALUES (
        $1, $2, $3, $4
      )
      RETURNING
        id
      ;
      `,
      [userId, bookId, "pending", approverId],
    );
    const applicationId = insertApplicationResult.rows[0].id;

    const user = await client.query(
      `
      SELECT
        *
      FROM
        users
      WHERE
        id = $1
      `,
      [userId],
    );

    const approver = await client.query(
      `
      SELECT
        *
      FROM
        users
      WHERE
        id = $1
      `,
      [approverId],
    );

    const book = await client.query(
      `
      SELECT
        *
      FROM
        books
      WHERE
        id = $1
      `,
      [bookId],
    );

    // メールの送信
    await sendRegisterApplication({
      to: approver.rows[0].email,
      user: user.rows[0].name,
      approver: approver.rows[0].name,
      book: book.rows[0].title,
    });

    // クエリの終了
    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "申請を受け付けました。",
      data: { applicationId },
    });
  } catch (e) {
    console.log(e);
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

// 申請の取得
router.get("/v1/application/retrieve", authenticateToken, async (req, res) => {
  console.log("/loan/v1/application/retrieve");

  const client = await pool.connect();

  try {
    // パラメータの取得
    const { id, status } = req.query;
    const userId = req.user.id;
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit ?? "20", 10), 1),
      100,
    );
    const offset = (page - 1) * limit;

    const values = [];
    const whereClauses = [];

    values.push(userId);
    whereClauses.push(`lh.user_id = $${values.length}`);

    if (id) {
      values.push(id);
      whereClauses.push(`lh.id = $${values.length}`);
    }

    if (status) {
      values.push(status);
      whereClauses.push(`lh.status = $${values.length}`);
    }

    // 申請を取得(全件数)
    const totalSql = `
      SELECT
        COUNT(*)
      FROM
        loan_histories lh
      ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""}
      ;
    `;
    const totalResult = await client.query(totalSql, values);
    const total = parseInt(totalResult.rows[0].count, 10);
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    if (total === 0) {
      return res.status(404).json({
        success: false,
        message: "申請が見つかりませんでした。",
        data: {
          applications: [],
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
        lh.id,
        lh.status,
        TO_CHAR(lh.requested_at, 'YYYY-MM-DD') AS requested_at,
        TO_CHAR(lh.loan_start_at, 'YYYY-MM-DD') AS loan_start_at,
        TO_CHAR(lh.loan_end_at, 'YYYY-MM-DD') AS loan_end_at,
        TO_CHAR(lh.returned_at, 'YYYY-MM-DD') AS returned_at,
        b.id as book_id,
        b.title_transcription as title_transcription,
        b.title as title,
        b.updated_at as updated_at,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', a.id,
              'name', a.name,
              'name_transcription', a.name_transcription
            )
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'
        ) AS authors,
        u.name as user_name,
        ap.name as approver_name
      FROM
        loan_histories lh
      LEFT JOIN books b
        ON b.id = lh.book_id
      LEFT JOIN book_authors ba
        ON ba.book_id = b.id
      LEFT JOIN authors a
        ON a.id = ba.author_id
      LEFT JOIN users u
        ON u.id = lh.user_id
      LEFT JOIN users ap
        ON ap.id = lh.approved_by
      ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""}
      GROUP BY
        lh.id, b.id, u.name, ap.name
      ORDER BY
        lh.requested_at DESC
      LIMIT ${limitClause} OFFSET ${offsetClause}
      ;
    `;
    const searchResult = await client.query(searchSql, values);
    const applications = camelcaseKeys(searchResult.rows);

    // cover_urlを挿入
    const applicationsWithCover = applications.map((application) => ({
      ...application,
      coverUrl: `/api/book/v1/retrieve/cover/${application.bookId}?update=${application.updatedAt}`,
    }));

    // 結果返却
    return res.status(200).json({
      success: true,
      message: "申請一覧を取得しました。",
      data: {
        applications: applicationsWithCover,
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
      message: "申請を取得できませんでした 管理者に問い合わせしてください。",
      data: null,
    });
  } finally {
    client.release();
  }
});

// 申請の更新
router.put(
  "/v1/application/update/:id",
  authenticateToken,
  async (req, res) => {
    console.log("/loan/v1/application/update");

    // 許可されたフロー遷移
    const allowedNext = {
      pending: new Set(["rejected"]),
      approved: new Set(["return_pending"]),
      return_pending: new Set([]),
      rejected: new Set([]),
      returned: new Set([]),
    };

    const client = await pool.connect();

    try {
      const loanId = req.params.id;
      const { status: nextStatus } = req.body;
      const userId = req.user.id;

      // 更新可能か
      const loanStatus = (
        await client.query(
          `
          SELECT
            status
          FROM
            loan_histories
          WHERE
            id = $1
            AND user_id = $2
          ;
          `,
          [loanId, userId],
        )
      ).rows[0].status;

      if (!loanStatus) {
        return res.status(404).json({
          success: false,
          message: "更新可能な申請がありませんでした。",
          data: null,
        });
      }

      // 遷移チェック
      if (!allowedNext[loanStatus]?.has(nextStatus)) {
        return res.status(409).json({
          success: false,
          message: `許可されない遷移です: ${loanStatus} -> ${nextStatus}`,
          data: null,
        });
      }

      // クエリの開始
      await client.query("BEGIN");

      // ステータスの更新
      await client.query(
        `
        UPDATE
          loan_histories
        SET
          status = $1,
          requested_at = CURRENT_TIMESTAMP
        WHERE
          id = $2
        ;
        `,
        [nextStatus, loanId],
      );

      const loan = await client.query(
        `
        SELECT
          book_id,
          approved_by
        FROM
          loan_histories
        WHERE
          id = $1
        ;
        `,
        [loanId],
      );

      const user = await client.query(
        `
        SELECT
          *
        FROM
          users
        WHERE
          id = $1
        ;
        `,
        [userId],
      );

      const approver = await client.query(
        `
        SELECT
          *
        FROM
          users
        WHERE
          id = $1
        ;
        `,
        [loan.rows[0].approved_by],
      );

      const book = await client.query(
        `
        SELECT
          *
        FROM
          books
        WHERE
          id = $1
        ;
        `,
        [loan.rows[0].book_id],
      );

      // メールの送信
      await sendUpdateApplication({
        to: approver.rows[0].email,
        user: user.rows[0].name,
        approver: approver.rows[0].name,
        book: book.rows[0].title,
        status: nextStatus,
      });

      // クエリの終了
      await client.query("COMMIT");

      return res.status(200).json({
        success: true,
        message: "申請を更新しました。",
        data: { loanId },
      });
    } catch (e) {
      console.log(e);
      await client.query("ROLLBACK");
      return res.status(500).json({
        success: true,
        message:
          "申請を更新できませんでした 管理者に問い合わせをしてください。",
        data: null,
      });
    } finally {
      client.release();
    }
  },
);

// 承認の取得
router.get(
  "/v1/approval/retrieve",
  authenticateToken,
  requireRole("admin", "approver"),
  async (req, res) => {
    console.log("/loan/v1/approval/retrieve");

    const client = await pool.connect();

    try {
      // パラメータの取得
      const { id, status } = req.query;
      const userId = req.user.id;
      const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
      const limit = Math.min(
        Math.max(parseInt(req.query.limit ?? "20", 10), 1),
        100,
      );
      const offset = (page - 1) * limit;

      const values = [];
      const whereClauses = [];

      values.push(userId);
      whereClauses.push(`lh.approved_by = $${values.length}`);

      if (id) {
        values.push(id);
        whereClauses.push(`lh.id = $${values.length}`);
      }

      if (status) {
        values.push(status);
        whereClauses.push(`lh.status = $${values.length}`);
      }
      values.push("rejected");
      whereClauses.push(`lh.status != $${values.length}`);

      // 申請を取得(全件数)
      const totalSql = `
        SELECT
          COUNT(*)
        FROM
          loan_histories lh
        ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""}
        ;
      `;
      const totalResult = await client.query(totalSql, values);
      const total = parseInt(totalResult.rows[0].count, 10);
      const totalPages = Math.max(Math.ceil(total / limit), 1);
      if (total === 0) {
        return res.status(404).json({
          success: false,
          message: "承認が見つかりませんでした。",
          data: {
            approvals: [],
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
          lh.id,
          lh.status,
          TO_CHAR(lh.requested_at, 'YYYY-MM-DD') AS requested_at,
          TO_CHAR(lh.loan_start_at, 'YYYY-MM-DD') AS loan_start_at,
          TO_CHAR(lh.loan_end_at, 'YYYY-MM-DD') AS loan_end_at,
          TO_CHAR(lh.returned_at, 'YYYY-MM-DD') AS returned_at,
          b.id as book_id,
          b.title_transcription as title_transcription,
          b.title as title,
          b.updated_at as updated_at,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', a.id,
                'name', a.name,
                'name_transcription', a.name_transcription
              )
            ) FILTER (WHERE a.id IS NOT NULL),
            '[]'
          ) AS authors,
          u.name as user_name,
          ap.name as approver_name
        FROM
          loan_histories lh
        LEFT JOIN books b
          ON b.id = lh.book_id
        LEFT JOIN book_authors ba
          ON ba.book_id = b.id
        LEFT JOIN authors a
          ON a.id = ba.author_id
        LEFT JOIN users u
          ON u.id = lh.user_id
        LEFT JOIN users ap
          ON ap.id = lh.approved_by
        ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""}
        GROUP BY
          lh.id, b.id, u.name, ap.name
        ORDER BY
          lh.requested_at DESC
        LIMIT ${limitClause} OFFSET ${offsetClause}
        ;
      `;
      const searchResult = await client.query(searchSql, values);
      const approvals = camelcaseKeys(searchResult.rows);

      // cover_urlを挿入
      const approvalsWithCover = approvals.map((approval) => ({
        ...approval,
        coverUrl: `/api/book/v1/retrieve/cover/${approval.bookId}?update=${approval.updatedAt}`,
      }));

      // 結果返却
      return res.status(200).json({
        success: true,
        message: "承認一覧を取得しました。",
        data: {
          approvals: approvalsWithCover,
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
        message: "書籍を取得できませんでした。管理者に問い合わせしてください。",
        data: null,
      });
    } finally {
      client.release();
    }
  },
);

// 承認の更新
router.put(
  "/v1/approval/update/:id",
  authenticateToken,
  requireRole("admin", "approver"),
  async (req, res) => {
    console.log("/loan/v1/approval/update");

    // 許可されたフロー遷移
    const allowedNext = {
      pending: new Set(["approved"]),
      approved: new Set([]),
      return_pending: new Set(["returned"]),
      rejected: new Set([]),
      returned: new Set([]),
    };

    const client = await pool.connect();

    try {
      const loanId = req.params.id;
      const { status: nextStatus } = req.body;
      const userId = req.user.id;

      // 承認可能か
      const loanStatus = (
        await client.query(
          `
          SELECT
            status
          FROM
            loan_histories
          WHERE
            id = $1
            AND approved_by = $2
          `,
          [loanId, userId],
        )
      ).rows[0].status;

      if (!loanStatus) {
        return res.status(404).json({
          success: false,
          message: "更新可能な承認がありませんでした。",
          data: null,
        });
      }

      // 遷移チェック
      if (!allowedNext[loanStatus]?.has(nextStatus)) {
        return res.status(409).json({
          success: false,
          message: `許可されない遷移です: ${loanStatus} -> ${nextStatus}`,
          data: null,
        });
      }

      // ステータスの更新
      if (nextStatus === "approved") {
        await client.query(
          `
          UPDATE
            loan_histories
          SET
            status = $1,
            approved_at = CURRENT_TIMESTAMP,
            loan_start_at = CURRENT_TIMESTAMP,
            loan_end_at = CURRENT_TIMESTAMP + INTERVAL '14 days'
          WHERE
            id = $2
          ;
          `,
          ["approved", loanId],
        );
      }

      if (nextStatus === "returned") {
        await client.query(
          `
          UPDATE
            loan_histories
          SET
            status = $1,
            returned_at = CURRENT_TIMESTAMP
          WHERE
            id = $2
          ;
          `,
          ["returned", loanId],
        );
      }

      const loan = await client.query(
        `
        SELECT
          book_id,
          approved_by
        FROM
          loan_histories
        WHERE
          id = $1
        ;
        `,
        [loanId],
      );

      const user = await client.query(
        `
        SELECT
          *
        FROM
          users
        WHERE
          id = $1
        ;
        `,
        [userId],
      );

      const approver = await client.query(
        `
        SELECT
          *
        FROM
          users
        WHERE
          id = $1
        ;
        `,
        [loan.rows[0].approved_by],
      );

      const book = await client.query(
        `
        SELECT
          *
        FROM
          books
        WHERE
          id = $1
        ;
        `,
        [loan.rows[0].book_id],
      );

      // メールの送信
      await sendUpdateApproval({
        to: user.rows[0].email,
        user: user.rows[0].name,
        approver: approver.rows[0].name,
        book: book.rows[0].title,
        status: nextStatus,
      });

      return res.status(200).json({
        success: true,
        message: "承認を更新しました。",
        data: { loanId },
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        success: false,
        message:
          "承認を更新できませんでした。管理者に問い合わせをしてください。",
        data: null,
      });
    } finally {
      client.release();
    }
  },
);

export default router;
