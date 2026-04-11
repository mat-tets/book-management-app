import camelcaseKeys from "camelcase-keys";
import express from "express";

import { pool } from "../connection/database.js";
import { STORAGE_BUCKET, minioClient } from "../connection/storage.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  isISBN,
  normalizeISBN,
  toDateYmdOrNull,
  toNullIfEmpty,
} from "../utils/normalizeDatabese.js";
import {
  getCoverNameFromDb,
  getOrCreateByName,
} from "../utils/operateDatabase.js";
import {
  deleteImage,
  getContentTypeFromObjectName,
  upload,
  uploadImageFromBuffer,
  uploadImageFromUrl,
} from "../utils/operateStorage.js";
import { toBool, toOrder, toSort } from "../utils/query.js";

const router = express.Router();

// 書籍の登録
router.post(
  "/v1/register",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    console.log("/book/v1/register");

    const client = await pool.connect();
    try {
      // パラメータの取得
      const {
        title,
        titleTranscription,
        edition,
        publisherName,
        publishDate,
        pages,
        genre,
        isbn,
        stockCount,
        authors,
      } = req.body;
      const trimmedTitle = String(title ?? "").trim();
      const normalizedTitleTranscription = toNullIfEmpty(
        String(titleTranscription ?? "").trim(),
      );
      const normalizedEdition = toNullIfEmpty(String(edition ?? "").trim());
      const normalizedPublishDate = toDateYmdOrNull(
        String(publishDate ?? "").trim(),
      );
      const normalizedAuthors = Array.isArray(authors) ? authors : [];

      if (!trimmedTitle || !isbn) {
        return res.status(400).json({
          success: false,
          message: "書籍名, ISBN は必須です。",
          data: null,
        });
      }

      try {
        // クエリの開始
        await client.query("BEGIN");

        // publishers テーブルに登録
        // 同名の出版社がすでにある場合は登録しない
        const publisherId = await getOrCreateByName(
          client,
          "publishers",
          publisherName,
        );

        // genres テーブルに登録
        // 同名のジャンルがすでにある場合は登録しない
        const genreId = await getOrCreateByName(client, "genres", genre);

        // books テーブルに登録
        const insertBookResult = await client.query(
          `
          INSERT INTO
            books (
              title,
              title_transcription,
              edition,
              publisher_id,
              publish_date,
              pages,
              genre_id,
              isbn,
              stock_count
            )
          VALUES (
            $1, $2, $3, $4, $5::date, $6, $7, $8, $9
          )
          RETURNING
            id
          ;
          `,
          [
            trimmedTitle,
            normalizedTitleTranscription,
            normalizedEdition,
            publisherId,
            normalizedPublishDate,
            pages,
            genreId,
            normalizeISBN(isbn),
            stockCount,
          ],
        );
        const bookId = insertBookResult.rows[0].id;

        for (const author of normalizedAuthors) {
          const { name, nameTranscription } = author;

          const existingAuthorResult = await client.query(
            `
            SELECT
              id
            FROM
              authors
            WHERE
              name = $1
              AND name_transcription IS NOT DISTINCT FROM $2
            LIMIT
              1
            ;
            `,
            [name, nameTranscription],
          );
          const authorId =
            existingAuthorResult.rows.length > 0
              ? existingAuthorResult.rows[0].id
              : (
                  await client.query(
                    `
                    INSERT INTO
                      authors (
                        name,
                        name_transcription
                      )
                    VALUES (
                      $1, $2
                    )
                    RETURNING
                      id
                    ;
                    `,
                    [name, nameTranscription],
                  )
                ).rows[0].id;

          await client.query(
            `
            INSERT INTO
              book_authors (
                book_id,
                author_id
              )
            VALUES (
              $1, $2
            )
            ;
            `,
            [bookId, authorId],
          );
        }

        await client.query("COMMIT");

        return res.status(201).json({
          success: true,
          message: "書籍を登録しました。",
          data: { bookId },
        });
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        success: false,
        message: "登録に失敗しました。管理者に問い合わせしてください。",
        data: null,
      });
    } finally {
      client.release();
    }
  },
);

// 書籍の取得
router.get("/v1/retrieve", async (req, res) => {
  console.log("/book/v1/retrieve");

  const client = await pool.connect();

  try {
    // パラメータの取得
    const { search, id, available, sort, order } = req.query;
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit ?? "20", 10), 1),
      100,
    );
    const offset = (page - 1) * limit;

    const { title, isbn } = (() => {
      const query = search ? normalizeISBN(search) : null;
      if (isISBN(query)) {
        return { title: null, isbn: query };
      } else {
        return { title: query, isbn: null };
      }
    })();

    const values = [];
    const whereClauses = [];

    if (id) {
      values.push(id);
      whereClauses.push(`b.id = $${values.length}`);
    }

    if (title) {
      values.push(`%${title}%`);
      whereClauses.push(`b.title ILIKE $${values.length}`);
    }

    if (isbn) {
      values.push(isbn);
      whereClauses.push(`b.isbn = $${values.length}`);
    }

    // ソート
    const allowedSorts = {
      new: "updated_at",
      title: "title",
      title_kana: "COALESCE(title_transcription, title)",
      random: "RANDOM()",
      popular: "loan_count",
    };
    const sortExpr = toSort(sort, allowedSorts, "updated_at");
    const dir = toOrder(order, sortExpr === "RANDOM()" ? "" : "DESC");
    const orderClause =
      sortExpr === "RANDOM()"
        ? `ORDER BY ${sortExpr}`
        : `ORDER BY ${sortExpr} ${dir}`;

    // 書籍を取得(全件数)
    const totalSql = `
      SELECT
        COUNT(*)
      FROM (
        SELECT 
          b.stock_count - COUNT(lh.id) FILTER (
            WHERE
              lh.status = 'approved'
              OR lh.status = 'return_pending'
          ) AS available
        FROM books b
        LEFT JOIN loan_histories lh
          ON lh.book_id = b.id
        ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""}
        GROUP BY b.id
      ) sub
      ${toBool(available) ? "WHERE available > 0" : ""}
      ;
    `;
    const totalResult = await client.query(totalSql, values);
    const total = parseInt(totalResult.rows[0].count, 10);
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    if (total === 0) {
      return res.status(404).json({
        success: false,
        message: "書籍が見つかりませんでした。",
        data: {
          books: [],
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

    // 書籍を取得(検索)
    values.push(limit);
    const limitClause = `$${values.length}`;

    values.push(offset);
    const offsetClause = `$${values.length}`;

    const searchSql = `
      SELECT *
      FROM (
        SELECT 
          b.id,
          b.title,
          b.title_transcription,
          b.edition,
          TO_CHAR(b.publish_date, 'YYYY-MM-DD') AS publish_date,
          b.publish_year,
          b.pages,
          b.isbn,
          b.stock_count,
          b.created_at,
          b.updated_at,
          p.name AS publisher_name,
          g.name AS genre_name,
          COUNT(DISTINCT lh.id) FILTER (
            WHERE
              lh.status = 'returned'
          ) AS loan_count,
          COUNT(DISTINCT lh.id) FILTER (
            WHERE
              lh.status = 'approved'
              OR lh.status = 'return_pending'
          ) AS on_loan,
          b.stock_count - COUNT(DISTINCT lh.id) FILTER (
            WHERE
              lh.status = 'approved'
              OR lh.status = 'return_pending'
          ) AS available,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', a.id,
                'name', a.name,
                'name_transcription', a.name_transcription
              )
            ) FILTER (WHERE a.id IS NOT NULL),
            '[]'
          ) AS authors
        FROM books b
        LEFT JOIN publishers p
          ON p.id = b.publisher_id
        LEFT JOIN genres g
          ON g.id = b.genre_id
        LEFT JOIN book_authors ba
          ON ba.book_id = b.id
        LEFT JOIN authors a
          ON a.id = ba.author_id
        LEFT JOIN loan_histories lh
          ON lh.book_id = b.id
        ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""}
        GROUP BY b.id, p.name, g.name
      ) sub
      ${toBool(available) ? "WHERE available > 0" : ""}
      ${orderClause}
      LIMIT ${limitClause} OFFSET ${offsetClause}
      ;
    `;
    const searchResult = await client.query(searchSql, values);
    const books = camelcaseKeys(searchResult.rows, { deep: true });

    // cover_urlを挿入
    const booksWithCover = books.map((book) => ({
      ...book,
      coverUrl: `/api/book/v1/retrieve/cover/${book.id}?update=${book.updatedAt}`,
    }));

    // 結果返却
    return res.status(200).json({
      success: true,
      message: "書籍を取得しました。",
      data: {
        books: booksWithCover,
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
});

// 書籍の更新
router.put(
  "/v1/update/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    console.log("/book/v1/update");

    const client = await pool.connect();

    try {
      // パラメータの取得
      const bookId = req.params.id;
      const {
        title,
        titleTranscription,
        edition,
        publisherName,
        publishDate,
        pages,
        genreName,
        isbn,
        stockCount,
        authors,
      } = req.body;
      const trimmedTitle = String(title ?? "").trim();
      const normalizedTitleTranscription = toNullIfEmpty(
        String(titleTranscription ?? "").trim(),
      );
      const normalizedEdition = toNullIfEmpty(String(edition ?? "").trim());
      const normalizedPublishDate = toDateYmdOrNull(
        String(publishDate ?? "").trim(),
      );
      const normalizedAuthors = Array.isArray(authors) ? authors : [];

      if (!trimmedTitle || !isbn) {
        return res.status(400).json({
          success: false,
          message: "書籍名, ISBN は必須です。",
          data: null,
        });
      }

      try {
        await client.query("BEGIN");

        const publisherId = await getOrCreateByName(
          client,
          "publishers",
          publisherName,
        );
        const genreId = await getOrCreateByName(client, "genres", genreName);

        await client.query(
          `
          UPDATE books SET
            title = $1,
            title_transcription = $2,
            edition = $3,
            publisher_id = $4,
            publish_date = $5::date,
            pages = $6,
            genre_id = $7,
            isbn = $8,
            stock_count = $9,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $10
          `,
          [
            trimmedTitle,
            normalizedTitleTranscription,
            normalizedEdition,
            publisherId,
            normalizedPublishDate,
            pages,
            genreId,
            normalizeISBN(isbn),
            stockCount,
            bookId,
          ],
        );
        await client.query(
          `
          DELETE
          FROM
            book_authors
          WHERE
            book_id = $1
          ;
          `,
          [bookId],
        );

        for (const author of normalizedAuthors) {
          const { name, nameTranscription } = author;

          const existingAuthorResult = await client.query(
            `
            SELECT
              id
            FROM
              authors
            WHERE
              name = $1
              AND name_transcription IS NOT DISTINCT FROM $2
            LIMIT 1
            ;
            `,
            [name, nameTranscription],
          );
          const authorId = existingAuthorResult.rowCount
            ? existingAuthorResult.rows[0].id
            : (
                await client.query(
                  `
                  INSERT INTO
                    authors (
                      name, name_transcription
                    )
                  VALUES (
                    $1, $2
                  ) RETURNING id
                  ;
                  `,
                  [name, nameTranscription],
                )
              ).rows[0].id;

          await client.query(
            `
            INSERT INTO
              book_authors (
                book_id, author_id
              )
            VALUES (
              $1, $2
            )
            ;
            `,
            [bookId, authorId],
          );
        }

        await client.query("COMMIT");

        return res.status(200).json({
          success: true,
          message: "書籍を更新しました。",
          data: { bookId },
        });
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      }
    } catch (e) {
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

// 書籍の削除
router.delete(
  "/v1/delete/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    console.log("/book/v1delete");

    const client = await pool.connect();
    try {
      // パラメータの取得
      const bookId = req.params.id;

      await client.query(
        `
        DELETE
        FROM
          books
        WHERE
          id = $1
        ;
        `,
        [bookId],
      );

      return res.status(200).json({
        success: true,
        message: "書籍を削除しました。",
        data: { bookId },
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        success: false,
        message: "書籍を削除できませんでした。管理者に問い合わせしてください。",
        data: null,
      });
    } finally {
      client.release();
    }
  },
);

// 画像の更新
router.put(
  "/v1/update/cover/:id",
  authenticateToken,
  requireRole("admin"),
  upload.single("cover"),
  async (req, res) => {
    console.log("/book/v1/update/cover");

    try {
      // パラメータの取得
      const bookId = req.params.id;

      if (req.file) {
        await uploadImageFromBuffer(bookId, req.file.buffer, req.file.mimetype);
      } else if (req.body?.coverUrl) {
        await uploadImageFromUrl(bookId, req.body.coverUrl);
      } else {
        return res.status(400).json({
          success: false,
          message: "画像が更新できませんでした。",
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: "画像を更新しました。",
        data: null,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        success: false,
        message: "画像を更新できませんでした。管理者に問い合わせしてください。",
        data: null,
      });
    }
  },
);

// 画像の削除
router.delete("/v1/delete/cover/:id", authenticateToken, async (req, res) => {
  console.log("/book/v1/delete/cover");

  try {
    // パラメータの取得
    const bookId = req.params.id;

    await deleteImage(bookId);

    return res.status(200).json({
      success: true,
      message: "画像を削除しました。",
      data: { bookId },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "画像を削除できませんでした。管理者に問い合わせしてください。",
      data: null,
    });
  }
});

// 画像の取得
router.get("/v1/retrieve/cover/:id", async (req, res) => {
  console.log("/book/v1/retrieve/cover");

  const client = await pool.connect();
  try {
    // パラメータの取得
    const bookId = req.params.id;

    const coverName = await getCoverNameFromDb(client, bookId);

    if (!coverName) {
      return res.status(404).end();
    }

    // Content-Type をセット meta優先→拡張子推測で保険
    const stat = await minioClient.statObject(STORAGE_BUCKET, coverName);
    const meta = stat?.metaData ?? {};
    const metaContentType =
      meta["content-type"] ??
      meta["Content-Type"] ??
      meta["Content-type"] ??
      null;
    const fallbackContentType = getContentTypeFromObjectName(coverName);
    const contentType = metaContentType ?? fallbackContentType;

    if (contentType) res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");

    const stream = await minioClient.getObject(STORAGE_BUCKET, coverName);
    stream.on("error", (err) => {
      console.log("stream error:", err);
      if (!res.headersSent) res.status(500).end();
      else res.end();
    });

    stream.pipe(res);
  } catch (e) {
    console.log(e);
    res.status(500).end();
  } finally {
    client.release();
  }
});

export default router;
