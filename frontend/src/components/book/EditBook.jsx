import { useRef } from "react";

import noImage from "../../assets/no-image.png";
import Loading from "../../layout/Loading";
import Button from "../button/Button";
import ConfirmButton from "../button/ConfirmButton";
import BookImage from "./BookImage";
import styles from "./EditBook.module.css";

const createFileFromUrl = async (url, filename = "no-image.png") => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
};

const EditBook = ({
  draft,
  setDraft,
  isDirty,
  updateText = "書籍の更新",
  onUpdate,
  resetText = "変更の取り消し",
  onReset,
}) => {
  const inputFileRef = useRef(null);

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const coverUrl = URL.createObjectURL(file);
    setDraft((d) => ({
      ...d,
      coverFile: file,
      coverUrl,
    }));
  };

  const handleCoverRemove = async () => {
    const file = await createFileFromUrl(noImage);
    setDraft((d) => ({
      ...d,
      coverFile: file,
      coverUrl: noImage,
    }));
  };

  const handleAuthorChange = (index, key) => (e) => {
    const value = e.target.value;
    setDraft((d) => {
      const next = [...d.authors];
      next[index] = { ...next[index], [key]: value };
      return { ...d, authors: next };
    });
  };

  const addAuthor = () => {
    setDraft((d) => ({
      ...d,
      authors: [
        ...d.authors,
        {
          name: "",
          nameTranscription: "",
        },
      ],
    }));
  };

  const removeAuthor = (index) => {
    setDraft((d) => {
      const next = [...d.authors];
      next.splice(index, 1);
      return { ...d, authors: next };
    });
  };

  if (!draft) return <Loading />;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Edit Book Page</p>
        <h2 className={styles.title}>{updateText}</h2>
        <p className={styles.sub}>
          書籍情報を更新して、最新の状態に保ちましょう。
        </p>
      </header>

      <div className={styles.content}>
        <aside className={styles.coverPanel}>
          <div className={styles.coverCard}>
            <div className={styles.coverImage}>
              <BookImage title={draft.title} coverUrl={draft.coverUrl} />
            </div>
            <div className={styles.coverMeta}>
              <p className={styles.coverTitle}>
                {draft.title || "タイトル未設定"}
              </p>
              <p className={styles.coverSubtitle}>
                {draft.publisherName || "出版社未設定"}
              </p>
            </div>
          </div>

          <div className={styles.uploadCard}>
            <span>表紙画像</span>
            <div className={styles.fileLabel}>
              <input
                ref={inputFileRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                style={{ display: "none" }}
              />
              <Button
                className={styles.fileInput}
                onClick={() => inputFileRef.current?.click()}
                variant="secondary"
              >
                ファイルを選択
              </Button>

              <Button onClick={handleCoverRemove} variant="secondary">
                画像を削除
              </Button>
            </div>
          </div>
        </aside>

        <section className={styles.formCard}>
          <div>
            <p className={styles.eyebrow}>Detail</p>
            <h3>書籍情報</h3>
          </div>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="titleTranscription">フリガナ</label>
              <input
                id="titleTranscription"
                className={styles.textInput}
                type="text"
                value={draft.titleTranscription}
                onChange={handleChange("titleTranscription")}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="title" className={styles.required}>
                書籍名
              </label>
              <input
                id="title"
                className={styles.textInput}
                type="text"
                value={draft.title}
                onChange={handleChange("title")}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="edition">版次</label>
              <input
                id="edition"
                className={styles.textInput}
                type="text"
                value={draft.edition}
                onChange={handleChange("edition")}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="publisherName">出版社</label>
              <input
                id="publisherName"
                className={styles.textInput}
                type="text"
                value={draft.publisherName}
                onChange={handleChange("publisherName")}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="publishDate">出版日</label>
              <input
                id="publishDate"
                className={styles.textInput}
                type="date"
                value={draft.publishDate}
                onChange={handleChange("publishDate")}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="pages">ページ数</label>
              <input
                id="pages"
                className={styles.textInput}
                type="number"
                value={draft.pages}
                onChange={handleChange("pages")}
                min="1"
                step="1"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="genreName">ジャンル</label>
              <input
                id="genreName"
                className={styles.textInput}
                type="text"
                value={draft.genreName}
                onChange={handleChange("genreName")}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="isbn" className={styles.required}>
                ISBN
              </label>
              <input
                id="isbn"
                className={styles.textInput}
                type="text"
                value={draft.isbn}
                onChange={handleChange("isbn")}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="stockCount">在庫数</label>
              <input
                id="stockCount"
                className={styles.textInput}
                type="number"
                value={draft.stockCount}
                onChange={handleChange("stockCount")}
                min="0"
                step="1"
              />
            </div>
          </div>

          <div className={styles.authors}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>Authors</p>
                <h3>著者</h3>
              </div>
              <Button onClick={addAuthor} variant="primary">
                著者を追加
              </Button>
            </div>

            <div className={styles.authorList}>
              {draft.authors.map((author, index) => (
                <div className={styles.authorCard} key={index}>
                  <div className={styles.authorFields}>
                    <input
                      className={styles.textInput}
                      type="text"
                      placeholder="フリガナ"
                      value={author.nameTranscription}
                      onChange={handleAuthorChange(index, "nameTranscription")}
                    />
                    <input
                      className={styles.textInput}
                      type="text"
                      placeholder="著者名"
                      value={author.name}
                      onChange={handleAuthorChange(index, "name")}
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeAuthor(index)}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <ConfirmButton
              onClick={onUpdate}
              variant="danger"
              confirmTitle={updateText}
              confirmMessage={["書籍情報を保存しますか？"]}
              confirmLabel="保存"
              disabled={!isDirty}
            >
              保存
            </ConfirmButton>
            <ConfirmButton
              onClick={onReset}
              variant="secondary"
              confirmTitle={resetText}
              confirmMessage={[
                "変更を取り消しますか？",
                "保存していない変更は失われます",
              ]}
              confirmLabel="取り消し"
              disabled={!isDirty}
            >
              取り消し
            </ConfirmButton>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EditBook;
