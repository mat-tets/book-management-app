// Array 正規化
export const toArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

// Boolean 正規化
export const toBool = (v) => {
  if (typeof v === "boolean") return v;
  const s = String(v).toLowerCase();
  return s === "true" || s === "1" || s === "yes";
};

// ソートのホワイトリスト
export const toSort = (v, allowed, def = allowed[0]) =>
  v && allowed[v] ? allowed[v] : def;

// Order 正規化
export const toOrder = (v, def = "ASC") => {
  const s = String(v || "").toUpperCase();
  return s === "DESC" ? "DESC" : def;
};

// ページ数 正規化
export const toPage = (v, def = 1) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : def;
};

//
export const toLimit = (v, def = 50, max = 200) => {
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n <= 0) return def;
  return Math.min(n, max);
};
