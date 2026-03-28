import pg from "pg";

// postgresql の INTEGER を JS の int型として扱う
pg.types.setTypeParser(pg.types.builtins.INT8, (val) => {
  return parseInt(val, 10);
});

// DB への接続
const { Pool } = pg;
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
