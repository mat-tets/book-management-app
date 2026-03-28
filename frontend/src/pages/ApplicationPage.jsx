import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import useSWR from "swr";

import { retrieveApplications } from "../api/loan";
import ApplicationList from "../components/application/ApplicationList";
import useAuth from "../hooks/useAuth";
import useNavigateWithViewTransition from "../hooks/useNavigateWithViewTransition";
import Loading from "../layout/Loading";
import PaginationList from "../layout/PaginationList";
import styles from "./ApplicationPage.module.css";

const DEFAULTS = {
  page: "1",
  limit: "20",
};

const ApplicationPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigateVT = useNavigateWithViewTransition();
  const status = searchParams.get("status") ?? "";

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

  // 申請の取得
  const { data, isLoading } = useSWR(
    searchParams.size === 0
      ? null
      : ["retrieveApprications", searchParams.toString()],
    ([, searchParams]) => retrieveApplications(searchParams, token),
  );
  const applications = data?.data?.applications ?? null;
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
    if ("status" in patch) {
      const v = patch.status ?? "";
      v ? next.set("status", v) : next.delete("status");
    }
    navigateVT(`.?${next}`);
  };

  const handlePageChange = (newPage) => updateParams({ page: newPage });
  const handleStatusChange = (e) =>
    updateParams({ status: e.target.value, page: DEFAULTS.page });

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Applications</p>
        <h2 className={styles.title}>申請一覧</h2>
      </header>
      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <div className={styles.panel}>
            <div className={styles.field}>
              <h3>ソート</h3>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="stauts"
                  value=""
                  checked={status === ""}
                  onChange={handleStatusChange}
                />
                すべて
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="stauts"
                  value="pending"
                  checked={status === "pending"}
                  onChange={handleStatusChange}
                />
                貸出申請中
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="stauts"
                  value="approved"
                  checked={status === "approved"}
                  onChange={handleStatusChange}
                />
                貸出中
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="stauts"
                  value="return_pending"
                  checked={status === "return_pending"}
                  onChange={handleStatusChange}
                />
                返却申請中
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="stauts"
                  value="returned"
                  checked={status === "returned"}
                  onChange={handleStatusChange}
                />
                返却済
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="stauts"
                  value="rejected"
                  checked={status === "rejected"}
                  onChange={handleStatusChange}
                />
                棄却
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
              <ApplicationList applications={applications} />
            </PaginationList>
          )}
        </section>
      </div>
    </div>
  );
};

export default ApplicationPage;
