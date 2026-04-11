const BASE_URL = "/api";

const defaultError = {
  success: false,
  message: "通信に失敗しました。時間をおいて再度お試しください。",
  data: null,
};

const parseResponseBody = async (res) => {
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return res.json();
  }

  const text = await res.text();
  if (!text) {
    return null;
  }

  return {
    success: res.ok,
    message: text,
    data: null,
  };
};

const normalizeResponse = (res, body) => {
  if (body && typeof body === "object" && "success" in body) {
    return body;
  }

  if (res.ok) {
    return {
      success: true,
      message: "",
      data: body,
    };
  }

  return {
    success: false,
    message:
      body && typeof body === "object" && "message" in body
        ? body.message
        : `リクエストに失敗しました (${res.status})`,
    data: body && typeof body === "object" && "data" in body ? body.data : null,
  };
};

const baseFetch = async (pathOrUrl, options = {}) => {
  // pathOrUrl を http://~~ の形式にする。
  const url = String(pathOrUrl).startsWith("http")
    ? pathOrUrl
    : `${BASE_URL}${pathOrUrl}`;

  // method を設定する method の指定がない場合は GETとする。
  const method = (options.method || "GET").toUpperCase();

  // header を設定する Content-Type の指定がない場合は application/jsonとする。
  const headers = { ...(options.headers || {}) };
  const body = options.body;
  if (method !== "GET" && method !== "HEAD") {
    if (!(typeof FormData !== "undefined" && body instanceof FormData)) {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
    } else {
      delete headers["Content-Type"];
    }
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const bodyData = await parseResponseBody(res);
    return normalizeResponse(res, bodyData);
  } catch (error) {
    console.log("fetch failed:", error);
    return defaultError;
  }
};

// 認証あり
export const apiFetch = async (pathOrUrl, options = {}, token) => {
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return baseFetch(pathOrUrl, { ...options, headers });
};

// 認証なし
export const publicApiFetch = async (pathOrUrl, options = {}) => {
  return baseFetch(pathOrUrl, options);
};
