import useSWR from "swr";

import { retrieveBooks } from "../api/book";
import BookFaceOut from "../components/book/BookFaceOut";
import Loading from "../layout/Loading";
import styles from "./HomePage.module.css";

const HomePage = () => {
  // 書籍の取得（人気順）
  const { data: popularBooksData, isLoading: popularBooksIsLoading } = useSWR(
    ["retrieveBooks", "popular"],
    ([, sort]) => retrieveBooks({ sort }),
  );
  const popularBooks = popularBooksData?.data?.books;

  // 書籍の取得（新作順）
  const { data: newBooksData, isLoading: newBooksIsLoading } = useSWR(
    ["retrieveBooks", "new"],
    ([, sort]) => retrieveBooks({ sort }),
  );
  const newBooks = newBooksData?.data?.books;

  // 書籍の取得（ランダム）
  const { data: randomBooksData, isLoading: randomBooksIsLoading } = useSWR(
    ["retrieveBooks", "random"],
    ([, sort]) => retrieveBooks({ sort }),
  );
  const randomBooks = randomBooksData?.data?.books;

  if (popularBooksIsLoading && newBooksIsLoading && randomBooksIsLoading) {
    return <Loading />;
  }

  return (
    <div className={styles.root}>
      <section>
        <h2>人気作</h2>
        <BookFaceOut books={popularBooks} />
      </section>
      <section>
        <h2>新作</h2>
        <BookFaceOut books={newBooks} />
      </section>
      <section>
        <h2>おまかせ</h2>
        <BookFaceOut books={randomBooks} />
      </section>
    </div>
  );
};

export default HomePage;
