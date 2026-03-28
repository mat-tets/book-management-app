import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import useSWR from "swr";

import { retrieveBooks } from "../api/book";
import BookList from "../components/book/BookList";
import useNavigateWithViewTransition from "../hooks/useNavigateWithViewTransition";
import Loading from "../layout/Loading";
import PaginationList from "../layout/PaginationList";
import styles from "./BookshelfPage.module.css";

const DEFAULTS = {
  page: "1",
  limit: "20",
  sort: "new",
};

const BookshelfPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigateVT = useNavigateWithViewTransition();
  const sort = searchParams.get("sort") ?? "new";
  const available = searchParams.get("available") === "1";

  // ページ表示のデフォルト設定
  useEffect(() => {
    // クエリパラメータに DEFAULTS を含める
    const next = new URLSearchParams(searchParams);
    Object.entries(DEFAULTS).forEach(([key, def]) => {
      if (!next.get(key)) next.set(key, def);
    });
    setSearchParams(next, { replace: true });

    // 画面遷移時に一番上にスクロールする
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [searchParams, setSearchParams]);

  // 書籍の取得
  const { data, isLoading } = useSWR(
    searchParams.size === 0 ? null : ["retrieveBooks", searchParams.toString()],
    ([, searchParams]) => retrieveBooks(searchParams),
  );
  const books = data?.data?.books ?? null;
  const pagination = data?.data?.pagination ?? {
    page: 1,
    total: 0,
    totalPages: 1,
  };

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    if ("page" in patch) {
      const v = patch.page ?? "";
      v ? next.set("page", v) : next.delete("page");
    }
    if ("sort" in patch) {
      const v = patch.sort ?? "";
      v ? next.set("sort", v) : next.delete("sort");
    }
    if ("available" in patch) {
      patch.available ? next.set("available", "1") : next.delete("available");
    }
    navigateVT(`.?${next}`);
  };

  const handlePageChange = (newPage) => updateParams({ page: newPage });
  const handleSortChange = (e) =>
    updateParams({ sort: e.target.value, page: DEFAULTS.page });
  const handleAvailableToggle = (e) =>
    updateParams({ available: e.target.checked, page: DEFAULTS.page });

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Bookshelf</p>
        <h2 className={styles.title}>書籍一覧</h2>
      </header>
      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <div className={styles.panel}>
            <div className={styles.field}>
              <h3>ソート</h3>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="sort"
                  value="popular"
                  checked={sort === "popular"}
                  onChange={handleSortChange}
                />
                人気順
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="sort"
                  value="new"
                  checked={sort === "new"}
                  onChange={handleSortChange}
                />
                新作順
              </label>
            </div>
            <div className={styles.field}>
              <h3>絞り込み</h3>
              <label>
                <input
                  type="checkbox"
                  value={available}
                  onChange={handleAvailableToggle}
                  checked={available}
                />
                貸出可能な書籍
              </label>
            </div>
          </div>
        </aside>
        <section className={styles.main}>
          {isLoading ? (
            <Loading />
          ) : (
            <PaginationList
              page={pagination.page}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onChange={handlePageChange}
            >
              <BookList
                books={books}
                opt={{ skeleton: searchParams.get("limit") ?? 20 }}
              />
            </PaginationList>
          )}
        </section>
      </div>
    </div>
  );
};

export default BookshelfPage;
