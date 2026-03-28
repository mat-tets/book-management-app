import Pagination from "./Pagination";
import styles from "./PaginationList.module.css";

const PaginationList = ({ children, page, total, totalPages, onChange }) => {
  return (
    <div className={styles.root}>
      {/* <div className={styles.pagination}>
        {total !== 0 && (
          <Pagination page={page} totalPages={totalPages} onChange={onChange} />
        )}
      </div> */}
      {children}
      <div className={styles.pagination}>
        {total !== 0 && (
          <Pagination page={page} totalPages={totalPages} onChange={onChange} />
        )}
      </div>
    </div>
  );
};

export default PaginationList;
