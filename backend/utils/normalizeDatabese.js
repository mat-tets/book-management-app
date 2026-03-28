// JP-eの正規表現
export const isJPE = /^[0-9A-Z]{20}$/i;

// ISBNの正規表現
export const isRawISBN10 = /^\d{9}[\dX]$/;
export const isRawISBN13 = /^\d{13}$/;
export const isHyphenISBN10 = /^\d{1-5}-\d{1-7}-\d{1-7}-[\dX]$/;
export const isHyphenISBN13 = /^\d{3}-\d{1-5}-\d{1-7}-\d{1-7}-\d$/;

// Emailの正規表現
const emailRegexp =
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// ""(空文字)をNULLにする関数
export const toNullIfEmpty = (v) => {
  return v === "" ? null : v;
};

// DATE(YYYY-mm-dd)か判定する関数
export const toDateYmdOrNull = (v) => {
  const s = toNullIfEmpty(v);
  if (!s) {
    return null;
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};

// メールアドレスを小文字にする関数
export const normalizeEmail = (email) => String(email).trim().toLowerCase();

// ISBNからハイフンを削除する関数
export const normalizeISBN = (v) => {
  const s = toNullIfEmpty(String(v).trim());
  return isHyphenISBN10.test(s) || isHyphenISBN13.test(s)
    ? s.replace(/-/g, "")
    : s;
};

// ISBNか判定する関数
export const isISBN = (v) => {
  if (isRawISBN10.test(v) || isRawISBN13.test(v)) {
    return true;
  }
};

export const isEmail = (v) => {
  return emailRegexp.test(v);
};
