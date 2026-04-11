import { apiFetch } from "./fetcher";

// ユーザの登録
export const registerUser = async (registerData, token) => {
  const path = `/user/v1/register`;
  return apiFetch(
    path,
    {
      method: "POST",
      body: JSON.stringify(registerData),
    },
    token,
  );
};

// ユーザの取得
export const retrieveUsers = async (params = {}, token) => {
  const query = new URLSearchParams(params).toString();
  const path = `/user/v1/retrieve${query ? `?${query}` : ""}`;
  return apiFetch(
    path,
    {
      method: "GET",
    },
    token,
  );
};

// ユーザの更新
export const updateUser = async (userId, updateData, token) => {
  const path = `/user/v1/update/${userId}`;
  return apiFetch(
    path,
    {
      method: "PUT",
      body: JSON.stringify(updateData),
    },
    token,
  );
};

// ユーザの削除
export const deleteUser = async (userId, token) => {
  const path = `/user/v1/delete/${userId}`;
  return apiFetch(
    path,
    {
      method: "DELETE",
    },
    token,
  );
};

// ログイン中ユーザのプロフィール更新
export const updateMyProfile = async (updateData, token) => {
  const path = `/user/v1/update/me`;
  return apiFetch(
    path,
    {
      method: "PUT",
      body: JSON.stringify(updateData),
    },
    token,
  );
};

// ログイン中ユーザのパスワード更新
export const updateMyPassword = async (updateData, token) => {
  const path = `/user/v1/update/password`;
  return apiFetch(
    path,
    {
      method: "PUT",
      body: JSON.stringify(updateData),
    },
    token,
  );
};
