import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import useSWR from "swr";

import { retrieveUsers } from "../api/user";
import UserList from "../components/user/UserList";
import useAuth from "../hooks/useAuth";
import useNavigateWithViewTransition from "../hooks/useNavigateWithViewTransition";
import Loading from "../layout/Loading";
import PaginationList from "../layout/PaginationList";
import SearchForm from "../layout/SearchForm";
import styles from "./ManageUserPage.module.css";

const DEFAULTS = {
  page: "1",
  limit: "20",
};

const ManageUserPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigateVT = useNavigateWithViewTransition();
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const role = searchParams.get("role") ?? "";

  const { token } = useAuth();

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

  // ユーザの取得
  const { data, isLoading } = useSWR(
    searchParams.size === 0 ? null : ["retrieveUsers", searchParams.toString()],
    ([, searchParams]) => retrieveUsers(searchParams, token),
  );
  const users = data?.data?.users ?? null;
  const pagination = data?.data?.pagination ?? {
    page: 1,
    total: 0,
    totalPages: 1,
  };

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    if ("search" in patch) {
      const v = patch.search ?? "";
      v ? next.set("search", v) : next.delete("search");
    }
    if ("page" in patch) {
      const v = patch.page ?? "";
      v ? next.set("page", v) : next.delete("page");
    }
    if ("role" in patch) {
      const v = patch.role ?? "";
      v ? next.set("role", v) : next.delete("role");
    }
    navigateVT(`.?${next}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search, page: DEFAULTS.page });
  };
  const handlePageChange = (newPage) => updateParams({ page: newPage });
  const handleRoleChange = (e) =>
    updateParams({ role: e.target.value, page: DEFAULTS.page });

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.pageName}>
          <p className={styles.eyebrow}>Manage Users</p>
          <h2 className={styles.title}>ユーザの管理</h2>
        </div>
        <div className={styles.search}>
          <SearchForm
            search={search}
            setSearch={setSearch}
            onSearch={handleSearch}
            variant="danger"
            placeholder="検索 （ ユーザ名 または メールアドレス ）"
          />
        </div>
      </header>
      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <div className={styles.panel}>
            <div className={styles.field}>
              <h3>ソート</h3>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="role"
                  value=""
                  checked={role === ""}
                  onChange={handleRoleChange}
                />
                すべて
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === "admin"}
                  onChange={handleRoleChange}
                />
                管理ユーザ
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="role"
                  value="approver"
                  checked={role === "approver"}
                  onChange={handleRoleChange}
                />
                承認ユーザ
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="role"
                  value="general"
                  checked={role === "general"}
                  onChange={handleRoleChange}
                />
                一般ユーザ
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="role"
                  value="lock"
                  checked={role === "lock"}
                  onChange={handleRoleChange}
                />
                不可ユーザ
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
              <UserList users={users} />
            </PaginationList>
          )}
        </section>
      </div>
    </div>
  );
};

export default ManageUserPage;
