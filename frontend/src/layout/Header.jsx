import { useEffect, useState } from "react";
import { VscThreeBars } from "react-icons/vsc";
import { useLocation } from "react-router-dom";

import useNavigateWithViewTransition from "../hooks/useNavigateWithViewTransition";
import styles from "./Header.module.css";
import Logo from "./Logo";
import SearchForm from "./SearchForm";

const Header = ({ onMenuToggle }) => {
  const navigateVT = useNavigateWithViewTransition();
  const location = useLocation();
  const [search, setSearch] = useState(() => {
    const p = new URLSearchParams(location.search);
    return p.get("search") ?? "";
  });

  // URL が変わったら入力も同期する
  useEffect(() => {
    if (location.pathname.includes("bookshelf")) {
      const p = new URLSearchParams(location.search);
      setSearch(p.get("search") ?? "");
    }
    return () => setSearch("");
  }, [location.pathname, location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigateVT(`/bookshelf?search=${search.trim() ?? ""}`);
  };

  return (
    <header className={styles.root}>
      <div className={styles.item}>
        <button className={styles.menu} onClick={onMenuToggle}>
          <VscThreeBars />
        </button>
        <Logo />
      </div>
      <SearchForm
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
        variant="primary"
        placeholder="検索 （ 書籍名 または ISBN ）"
      />
    </header>
  );
};

export default Header;
