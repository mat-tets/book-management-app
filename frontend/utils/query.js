/**
 * オブジェクト → URL クエリ文字列
 * - 配列: ?k=a&k=b
 * - null/undefined/"" は除外
 * - boolean/number/Date は文字列化
 */
export const buildQuery = (params = {}) => {
  const sp = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v == null || v === "") return;
        sp.append(key, toStr(v));
      });
    } else {
      sp.append(key, toStr(value));
    }
  }
  return sp.toString();
};

const toStr = (v) => {
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  return String(v);
};
