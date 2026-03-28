import express from "express";
import { parseStringPromise } from "xml2js";

import {
  isISBN,
  isJPE,
  isRawISBN10,
  isRawISBN13,
  normalizeISBN,
} from "../utils/normalizeDatabese.js";
import { toArray } from "../utils/query.js";

const router = express.Router();

// xml 属性があったら null、なければテキスト返す
const extractPlainText = (node) => {
  if (!node) return null;

  // 文字列だけの場合（属性なし）
  if (typeof node === "string") {
    return node;
  }

  // オブジェクトの場合
  if (typeof node === "object") {
    // 属性があるなら除外
    if (node.$ && Object.keys(node.$).length > 0) {
      return null;
    }
    return node._ ?? null;
  }
  return null;
};

const extractPlainTexts = (nodes) =>
  toArray(nodes).map(extractPlainText).filter(Boolean);

// xml から 指定したキーを取得する
const extractFirstPlainText = (nodes) => {
  if (!nodes) return null;
  const arr = Array.isArray(nodes) ? nodes : [nodes];
  for (const node of arr) {
    const value = extractPlainText(node);
    if (value) return value;
  }
  return null;
};

// 書籍にJP-eとISBNがあれば取得する関数
const extractBookCodes = (seeAlsoList) => {
  return seeAlsoList
    .map((seeAlso) => seeAlso?.$?.["rdf:resource"])
    .map((url) => {
      const match = url.match(/books\.or\.jp\/book-details\/([^/]+)$/);
      return match ? match[1] : null;
    })
    .filter(Boolean);
};

// 検索対象(図書，紙)のデータグループ
const MEDIA_TYPE = "books";
const COUNT = 20;

router.get("/v1", async (req, res) => {
  console.log("/opensearch/v1");
  try {
    // TODO 改修の余地あり
    const { search } = req.query;
    const { title, isbn } = (() => {
      const query = normalizeISBN(search);
      if (isISBN(query)) {
        return { title: null, isbn: query };
      } else {
        return { title: query, isbn: null };
      }
    })();
    const query = {};
    if (title) {
      query.title = title.trim();
    }
    if (isbn) {
      query.isbn = isbn;
    }
    const searchString = new URLSearchParams(query).toString();
    const url = `https://ndlsearch.ndl.go.jp/api/opensearch?dpid=iss-ndl-opac&cnt=${COUNT}&mediatype=${MEDIA_TYPE}&${searchString}`;
    console.log(url);

    // 書籍データの取得
    const xmlResult = await fetch(url);
    const xmlText = await xmlResult.text();
    const json = await parseStringPromise(xmlText);
    const books = json["rss"]["channel"][0]["item"] ?? null;
    if (books === null) {
      return res.status(404).json({
        success: false,
        message: "検索がヒットしませんでした。",
        data: null,
      });
    }

    // 書籍データ配列の作成
    const records = books.map((book) => {
      const seeAlso = extractBookCodes(book["rdfs:seeAlso"]);
      const jpe = seeAlso.find((code) => isJPE.test(code)) ?? null;
      const isbn =
        seeAlso.find(
          (code) => isRawISBN10.test(code) || isRawISBN13.test(code),
        ) ?? null;
      const coverUrl = `https://ndlsearch.ndl.go.jp/thumbnail/${isbn || jpe}.jpg`;

      // 著者配列の作成
      const names = extractPlainTexts(book["dc:creator"]);
      const nameTranscriptions = extractPlainTexts(
        book["dcndl:creatorTranscription"],
      );
      const authors =
        names?.map((name, i) => ({
          name,
          nameTranscription: nameTranscriptions?.[i] ?? null,
        })) || [];

      return {
        title: extractFirstPlainText(book["dc:title"]),
        titleTranscription: extractFirstPlainText(
          book["dcndl:titleTranscription"],
        ),
        edition: extractFirstPlainText(book["dcndl:edition"]),
        publisherName: extractFirstPlainText(book["dc:publisher"]),
        publishDate: extractFirstPlainText(book["dcterms:issued"])?.replace(
          /^(\d{4})\.(\d{1,2})$/,
          (_, y, m) => `${y}-${m.padStart(2, "0")}-01`,
        ),
        pages: extractFirstPlainText(book["dc:extent"])?.replace(/p$/i, ""),
        genreName: extractFirstPlainText(book["dc:subject"]),
        isbn: isbn,
        jpe: jpe,
        authors: authors,
        coverUrl: coverUrl,
      };
    });

    return res.status(200).json({
      success: true,
      message: "書籍を取得しました。",
      data: {
        books: records,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "書籍を取得できませんでした。管理者に問い合わせしてください。",
      data: null,
    });
  }
});

export default router;
