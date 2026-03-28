import multer from "multer";

import { pool } from "../connection/database.js";
import { STORAGE_BUCKET, minioClient } from "../connection/storage.js";
import { getCoverNameFromDb, setCoverNameToDb } from "./operateDatabase.js";

// 画像取得 ( multer ) の設定
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Content-Type → extension
const imageExtensionByContentType = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/bmp": "bmp",
  "image/svg+xml": "svg",
  "image/tiff": "tiff",
};

// extension → Content-Type
const contentTypeByImageExtension = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  svg: "image/svg+xml",
  tiff: "image/tiff",
  tif: "image/tiff",
};

// Content-Typeから拡張子の取得
const getImageExtensionFromContentType = (contentType) => {
  if (!contentType) return null;
  const normalized = contentType.split(";")[0].trim().toLowerCase();
  return imageExtensionByContentType[normalized] ?? null;
};

// URLから拡張子の取得
const getImageExtensionFromUrl = (coverUrl) => {
  try {
    const url = new URL(coverUrl);
    const match = url.pathname.toLowerCase().match(/\.([a-z0-9]+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

// 画像データからコンテンツタイプの取得
export const getContentTypeFromObjectName = (objectName) => {
  const match = objectName.toLowerCase().match(/\.([a-z0-9]+)$/);
  const ext = match ? match[1] : null;
  return ext ? (contentTypeByImageExtension[ext] ?? null) : null;
};

// 画像の削除
const removeObjectIfExists = async (bucket, objectName) => {
  if (!objectName) return;
  try {
    await minioClient.removeObject(bucket, objectName);
  } catch (e) {
    console.log("removeObjectIfExists:", e?.message ?? e);
  }
};

// URLから画像のアップロード
export const uploadImageFromUrl = async (bookId, coverUrl) => {
  const coverResponse = await fetch(coverUrl);
  if (!coverResponse.ok) {
    throw new Error(`Failed to fetch cover image: ${coverResponse.status}`);
  }

  const arrayBuffer = await coverResponse.arrayBuffer();
  const contentType = coverResponse.headers.get("content-type");

  const extension =
    getImageExtensionFromContentType(contentType) ??
    getImageExtensionFromUrl(coverUrl) ??
    "bin";

  const coverName = `${bookId}.${extension}`;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const prevCoverName = await getCoverNameFromDb(client, bookId);

    await removeObjectIfExists(STORAGE_BUCKET, prevCoverName);

    const meta = contentType ? { "Content-Type": contentType } : undefined;
    await minioClient.putObject(
      STORAGE_BUCKET,
      coverName,
      Buffer.from(arrayBuffer),
      meta,
    );

    await setCoverNameToDb(client, bookId, coverName);

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

// Buffer(アップロード)から画像をアップロード
export const uploadImageFromBuffer = async (bookId, buffer, contentType) => {
  const extension = getImageExtensionFromContentType(contentType) ?? "bin";
  const coverName = `${bookId}.${extension}`;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const prevCoverName = await getCoverNameFromDb(client, bookId);
    await removeObjectIfExists(STORAGE_BUCKET, prevCoverName);

    await minioClient.putObject(STORAGE_BUCKET, coverName, buffer, {
      "Content-Type": contentType,
    });

    await setCoverNameToDb(client, bookId, coverName);

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

// 画像の削除
export const deleteImage = async (bookId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const prevCoverName = await getCoverNameFromDb(client, bookId);
    await removeObjectIfExists(STORAGE_BUCKET, prevCoverName);

    await setCoverNameToDb(client, bookId, null);

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};
