import { apiFetch, publicApiFetch } from "./fetcher";

// 書籍の登録
export const registerBook = async (registerData, token) => {
  const path = `/book/v1/register`;
  return apiFetch(
    path,
    {
      method: "POST",
      body: JSON.stringify(registerData),
    },
    token,
  );
};

// 書籍の取得
export const retrieveBooks = async (params) => {
  const query = new URLSearchParams(params).toString();
  const path = `/book/v1/retrieve${query ? `?${query}` : ""}`;
  return publicApiFetch(path, { method: "GET" });
};

// 書籍の更新
export const updateBook = async (bookId, updateData, token) => {
  const path = `/book/v1/update/${bookId}`;
  return apiFetch(
    path,
    {
      method: "PUT",
      body: JSON.stringify(updateData),
    },
    token,
  );
};

// 書籍の削除
export const deleteBook = async (bookId, token) => {
  const path = `/book/v1/delete/${bookId}`;
  return apiFetch(
    path,
    {
      method: "DELETE",
    },
    token,
  );
};

// 画像の更新
export const updateImage = async (bookId, coverData, token) => {
  const path = `/book/v1/update/cover/${bookId}`;
  return apiFetch(
    path,
    {
      method: "PUT",
      body: coverData,
    },
    token,
  );
};

// 画像の削除
export const deleteImage = async (bookId, token) => {
  const path = `/book/v1/delete/cover/${bookId}`;
  return apiFetch(
    path,
    {
      method: "DELETE",
    },
    token,
  );
};
