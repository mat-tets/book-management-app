import { publicApiFetch } from "./fetcher";

export const fetchOpensearch = async (params) => {
  const query = new URLSearchParams(params).toString() ?? "";
  const path = `/opensearch/v1?${query}`;
  return publicApiFetch(path, {
    method: "GET",
  });
};
