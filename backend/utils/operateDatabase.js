import { toNullIfEmpty } from "./normalizeDatabese.js";

const ALLOWED_TABLES = new Set(["publishers", "genres"]);

// cover_nameの取得
export const getCoverNameFromDb = async (client, bookId) => {
  const coverName =
    (
      await client.query(
        `
        SELECT
          cover_name
        FROM
          books
        WHERE
          id = $1
        `,
        [bookId],
      )
    ).rows[0]?.cover_name ?? null;
  return coverName;
};

// cover_nameの更新
export const setCoverNameToDb = async (client, bookId, coverNameOrNull) => {
  await client.query(
    `
    UPDATE
      books
    SET
      cover_name = $1,
      updated_at = NOW()
    WHERE
      id = $2
    `,
    [coverNameOrNull, bookId],
  );
};

// table から value を検索する
// すでに存在すればその ID を返す。なければ insert して ID を返す。
export const getOrCreateByName = async (client, table, value) => {
  if (!ALLOWED_TABLES.has(table)) {
    throw new Error(`Unsupported table: ${table}`);
  }
  const name = toNullIfEmpty(value);
  if (!name) {
    return null;
  }
  const found = await client.query(
    `
    SELECT
      id
    FROM
      ${table}
    WHERE
      name = $1
    LIMIT
      1
    ;
    `,
    [name],
  );
  if (found.rows.length !== 0) {
    return found.rows[0].id;
  }
  const insert = await client.query(
    `
    INSERT INTO
      ${table} (
        name
      )
    VALUES (
      $1
    )
    RETURNING
      id
    ;
    `,
    [name],
  );
  return insert.rows[0].id;
};
