import { Client } from "minio";

// オブジェクトストレージへの接続
export const minioClient = new Client({
  endPoint: process.env.STORAGE_ENDPOINT,
  port: Number(process.env.STORAGE_PORT),
  useSSL: false,
  accessKey: process.env.STORAGE_ACCESS_KEY,
  secretKey: process.env.STORAGE_SECRET_KEY,
});

export const STORAGE_BUCKET = process.env.STORAGE_BUCKET;
