const BASE_URL = "/api";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  const [res] = await Promise.all([
    fetch(url, { ...options, headers }),
    delay(0),
  ]);
  const json = await res.json();
  return json;
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
