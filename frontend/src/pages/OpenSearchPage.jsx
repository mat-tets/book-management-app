import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import useSWR from "swr";

import { fetchOpensearch } from "../api/opensearch";
import BookList from "../components/book/BookList";
import useNavigateWithViewTransition from "../hooks/useNavigateWithViewTransition";
import Loading from "../layout/Loading";
import SearchForm from "../layout/SearchForm";
import styles from "./OpensearchPage.module.css";

const OpenSearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigateVT = useNavigateWithViewTransition();
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");

  const { data, isLoading } = useSWR(
    searchParams.size === 0
      ? null
      : ["fetchOpensearch", searchParams.toString()],
    ([, searchParams]) => fetchOpensearch(searchParams),
  );
  const books = data?.data?.books ?? null;

  const handleSearch = async (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim() !== "") {
      params.set("search", search.trim());
    }
    navigateVT(`/manage/opensearch?${params.toString()}`);
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.pageName}>
          <p className={styles.eyebrow}>Manage Users</p>
          <h2 className={styles.title}>書籍検索</h2>
        </div>
        <div className={styles.search}>
          <SearchForm
            search={search}
            setSearch={setSearch}
            onSearch={handleSearch}
            variant="danger"
            placeholder="検索 （ 書籍名 または ISBN ）"
          />
        </div>
      </header>
      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <p>国立国会図書館サーチのAPIを利用して、書籍情報を取得します。</p>
          <p>検索件数の上限は20です。</p>
          <p>ISBNでの検索をおすすめします。</p>
        </aside>
        <div className={styles.main}>
          {isLoading ? <Loading /> : <BookList books={books} />}
        </div>
      </div>
    </div>
  );
};

export default OpenSearchPage;
