import { FaSearch } from "react-icons/fa";

import styles from "./SearchForm.module.css";

const SearchForm = ({
  search,
  setSearch,
  onSearch,
  variant = "primary",
  placeholder = "検索",
}) => {
  return (
    <div className={styles.root}>
      <form className={`${styles.bar} ${styles[variant]}`} onSubmit={onSearch}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
        />
        <button type="submit" className={styles[variant]}>
          <FaSearch />
        </button>
      </form>
    </div>
  );
};

export default SearchForm;
