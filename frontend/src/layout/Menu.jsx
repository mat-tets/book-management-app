import { Link } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import styles from "./Menu.module.css";

const Menu = ({ isMenuOpen, onMenuClose }) => {
  const { user, signOut } = useAuth();

  // 不可ユーザメニュー
  const banMenu = ["lock"].includes(user?.role) ? (
    <div className={styles.list} onClick={onMenuClose}>
      <Link to="/" onClick={signOut}>
        サインアウト
      </Link>
    </div>
  ) : undefined;

  // ユーザメニュー
  const userMenu = ["admin", "approver", "general"].includes(user?.role) ? (
    <div className={styles.list} onClick={onMenuClose}>
      <Link to="/my-page">マイページ</Link>
      <Link to="/application?page=1&limit=20">申請一覧</Link>
    </div>
  ) : undefined;

  // 承認者メニュー
  const approverMenu = ["admin", "approver"].includes(user?.role) ? (
    <div className={styles.list} onClick={onMenuClose}>
      <Link to="/approval?page=1&limit=20">承認一覧</Link>
    </div>
  ) : undefined;

  // 管理者メニュー
  const adminMenu = ["admin"].includes(user?.role) ? (
    <>
      <div className={styles.list} onClick={onMenuClose}>
        <Link to="/manage/user?page=1&limit=20">ユーザの管理</Link>
        <Link to="/manage/user/register">ユーザの追加</Link>
      </div>
      <div className={styles.list} onClick={onMenuClose}>
        <Link to="/manage/book?sort=popular&page=1&limit=20">書籍の管理</Link>
        <Link to="/manage/book/register">書籍の追加</Link>
        <Link to="/manage/opensearch">書籍の追加（API）</Link>
      </div>
    </>
  ) : undefined;

  return (
    <>
      <menu className={`${styles.root} ${isMenuOpen ? styles.open : ""}`}>
        <nav className={styles.menu}>
          <div className={styles.list} onClick={onMenuClose}>
            <Link to="/">ホーム</Link>
            <Link to="/bookshelf?sort=popular&page=1&limit=20">人気作</Link>
            <Link to="/bookshelf?sort=new&page=1&limit=20">新作</Link>
          </div>
          {!user && (
            <div className={styles.list} onClick={onMenuClose}>
              <Link to="/signin">サインイン</Link>
            </div>
          )}
          {banMenu}
          {userMenu}
          {approverMenu}
          {adminMenu}
        </nav>
      </menu>
      <div
        className={`${styles.overlay} ${isMenuOpen ? styles.open : ""}`}
        onClick={onMenuClose}
      ></div>
    </>
  );
};

export default Menu;
