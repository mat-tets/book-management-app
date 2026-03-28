import styles from "./BookDetail.module.css";

const BookDetail = ({ book, opt = {} }) => {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        {(opt.header || opt.titleTranscription) && (
          <p className={styles.titleTranscription}>
            {book.titleTranscription || "-"}
          </p>
        )}
        {(opt.header || opt.titleTranscription) && (
          <h2 className={styles.title}>{book.title || "-"}</h2>
        )}
        {(opt.header || opt.authors) && (
          <div className={styles.author}>
            {book.authors.length > 0
              ? book.authors.map((author, i) => <p key={i}>{author.name}</p>)
              : "-"}
            {book.authors.length > 0 && <span>(著)</span>}
          </div>
        )}
      </header>
      <div className={styles.detail}>
        {opt.edition && (
          <div className={styles.field}>
            <label>版次</label>
            <div className={styles.readonly}>{book.edition || "-"}</div>
          </div>
        )}
        {opt.publisherName && (
          <div className={styles.field}>
            <label>出版社</label>
            <div className={styles.readonly}>{book.publisherName || "-"}</div>
          </div>
        )}
        {opt.publishDate && (
          <div className={styles.field}>
            <label>出版日</label>
            <div className={styles.readonly}>{book.publishDate || "-"}</div>
          </div>
        )}
        {opt.isbn && (
          <div className={styles.field}>
            <label>ISBN</label>
            <div className={styles.readonly}>{book.isbn || "-"}</div>
          </div>
        )}
        {opt.genreName && (
          <div className={styles.field}>
            <label>ジャンル</label>
            <div className={styles.readonly}>{book.genreName || "-"}</div>
          </div>
        )}
        {opt.pages && (
          <div className={styles.field}>
            <label>ページ数</label>
            <div className={styles.readonly}>{book.pages}</div>
          </div>
        )}
        {opt.stockCount && (
          <div className={styles.field}>
            <label>在庫数</label>
            <div className={styles.readonly}>{book.stockCount}</div>
          </div>
        )}
        {opt.loanCount && (
          <div className={styles.field}>
            <label>貸出回数</label>
            <div className={styles.readonly}>{book.loanCount}</div>
          </div>
        )}
        {opt.available && (
          <div className={styles.field}>
            <label>貸出可能数</label>
            <div className={styles.readonly}>{book.available}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetail;
