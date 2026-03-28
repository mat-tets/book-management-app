import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowRight,
  MdOutlineKeyboardDoubleArrowLeft,
} from "react-icons/md";

import styles from "./Pagination.module.css";

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

// page: 現在のページ(1始まり)
// totalPages: 総ページ数
// onChange: (newPage) => void
// siblingCount: 現在ページの前後に何個出すか（2なら前後2ページ）
const Pagination = ({ page, totalPages, onChange, siblingCount = 2 }) => {
  if (totalPages <= 1) return null;

  const safePage = clamp(page, 1, totalPages);

  const start = Math.max(1, safePage - siblingCount);
  const end = Math.min(totalPages, safePage + siblingCount);

  // 例: total=5, page=3 -> [1,2,3,4,5]
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const go = (p) => onChange(clamp(p, 1, totalPages));

  const isFirst = safePage === 1;
  const isLast = safePage === totalPages;

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      {/* 先頭へ */}
      <button
        type="button"
        className={styles.navButton}
        onClick={() => go(1)}
        disabled={isFirst}
        aria-label="First page"
      >
        <MdOutlineKeyboardDoubleArrowLeft />
      </button>

      {/* 前へ */}
      <button
        type="button"
        className={styles.navButton}
        onClick={() => go(safePage - 1)}
        disabled={isFirst}
        aria-label="Previous page"
      >
        <MdKeyboardArrowLeft />
      </button>

      {/* ページ番号 */}
      <div className={styles.pages}>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`${styles.pageButton} ${
              p === safePage ? styles.active : ""
            }`}
            onClick={() => go(p)}
            aria-current={p === safePage ? "page" : undefined}
            disabled={p === safePage}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 次へ */}
      <button
        type="button"
        className={styles.navButton}
        onClick={() => go(safePage + 1)}
        disabled={isLast}
        aria-label="Next page"
      >
        <MdKeyboardArrowRight />
      </button>

      {/* 末尾へ */}
      <button
        type="button"
        className={styles.navButton}
        onClick={() => go(totalPages)}
        disabled={isLast}
        aria-label="Last page"
      >
        <MdKeyboardDoubleArrowRight />
      </button>
    </nav>
  );
};

export default Pagination;
