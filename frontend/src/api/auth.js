import { apiFetch, publicApiFetch } from "./fetcher";

// ユーザのサインアップ
export const signUpUser = async (payload) => {
  const path = `/auth/v1/signup`;
  return publicApiFetch(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// ユーザのサインイン
export const signInUser = async (payload) => {
  const path = `/auth/v1/signin`;
  return publicApiFetch(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// 認証メールの確認
export const verifyEmail = async (payload) => {
  const path = `/auth/v1/verify-email`;
  return publicApiFetch(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// 認証メールの再送
export const resendVerification = async (payload) => {
  const path = `/auth/v1/resend-verification`;
  return publicApiFetch(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// パスワード再設定メールの送信
export const forgotPassword = async (payload) => {
  const path = `/auth/v1/forgot-password`;
  return publicApiFetch(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// パスワード再設定
export const resetPassword = async (payload) => {
  const path = `/auth/v1/reset-password`;
  return publicApiFetch(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// ユーザのトークン認証
export const authenticateToken = async (token) => {
  const path = `/auth/v1/me`;
  return apiFetch(
    path,
    {
      method: "GET",
    },
    token,
  );
};
