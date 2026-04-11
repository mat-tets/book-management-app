import { apiFetch } from "./fetcher";

// 申請の登録
export const registerApplication = async (registerData, token) => {
  const path = `/loan/v1/application/register`;
  return apiFetch(
    path,
    {
      method: "POST",
      body: JSON.stringify(registerData),
    },
    token,
  );
};

// 申請の取得
export const retrieveApplications = async (params, token) => {
  const query = new URLSearchParams(params).toString();
  const path = `/loan/v1/application/retrieve${query ? `?${query}` : ""}`;
  return apiFetch(
    path,
    {
      method: "GET",
    },
    token,
  );
};

// 申請の更新
export const updateApplication = async (loanId, updateData, token) => {
  const path = `/loan/v1/application/update/${loanId}`;
  return apiFetch(
    path,
    {
      method: "PUT",
      body: JSON.stringify(updateData),
    },
    token,
  );
};

// 承認の取得
export const retrieveApprovals = async (params = {}, token) => {
  const query = new URLSearchParams(params).toString();
  const path = `/loan/v1/approval/retrieve${query ? `?${query}` : ""}`;
  return apiFetch(
    path,
    {
      method: "GET",
    },
    token,
  );
};

// 承認の更新
export const updateApproval = async (loanId, updateData, token) => {
  const path = `/loan/v1/approval/update/${loanId}`;
  return apiFetch(
    path,
    {
      method: "PUT",
      body: JSON.stringify(updateData),
    },
    token,
  );
};
