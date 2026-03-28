import { useLocation } from "react-router-dom";

import useNavigateWithViewTransition from "../../hooks/useNavigateWithViewTransition";
import BookDetail from "./BookDetail";
import BookImage from "./BookImage";
import styles from "./BookList.module.css";

const BookList = ({ books, opt = {} }) => {
  const location = useLocation();
  const navigateVT = useNavigateWithViewTransition();

  const source = location.pathname;

  // 書籍を押下すると、モーダル表示
  const navigateBookModal = (book) => {
    navigateVT(`${source}/${book.id ?? book.isbn}`, {
      state: { book, backgroundLocation: location },
    });
  };

  if (!books && opt.skeleton) {
    return (
      <ul className={styles.root}>
        {Array.from({ length: opt.skeleton }).map((_, i) => (
          <li key={`skelton-${i}`} className={styles.list}></li>
        ))}
      </ul>
    );
  }

  if (!books) return;

  if (books.length === 0) return <h3>書籍はありません。</h3>;

  return (
    <ul className={styles.root}>
      {books.map((book, i) => (
        <li
          key={i}
          className={styles.list}
          onClick={() => navigateBookModal(book)}
        >
          <div className={styles.image}>
            <BookImage title={book.title} coverUrl={book.coverUrl} />
          </div>
          <div className={styles.main}>
            <BookDetail
              book={book}
              opt={{
                header: true,
                publisherName: true,
                publishDate: true,
                genreName: true,
                pages: true,
                loanCount: true,
                available: true,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default BookList;
