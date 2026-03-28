import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import { isEqual } from "lodash";
import useSWR from "swr";

import { retrieveUsers, updateUser } from "../api/user";
import ConfirmButton from "../components/button/ConfirmButton";
import UserImage from "../components/user/UserImage";
import useAuth from "../hooks/useAuth";
import useConfirm from "../hooks/useConfirm";
import useNavigateWithViewTransition from "../hooks/useNavigateWithViewTransition";
import Loading from "../layout/Loading";
import NotFoundPage from "./NotFoundPage";
import styles from "./UpdateUserPage.module.css";

const toDraft = (user) => ({
  name: user.name ?? "",
  email: user.email ?? "",
  role: user.role ?? "",
});

const normDraftForCompare = (d) => ({
  name: (d?.name ?? "").trim(),
  email: (d?.email ?? "").trim(),
  role: d?.role,
});

const UpdateUserPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigateVT = useNavigateWithViewTransition();

  const { token } = useAuth();
  const { confirm } = useConfirm();

  const [draft, setDraft] = useState(null);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  // state.userがない場合、データベースから再取得
  const stateUser = location.state?.user ?? null;
  const swrKey = stateUser ? null : ["retrieveUsers", id];
  const { data, isLoading } = useSWR(swrKey, ([, id]) =>
    retrieveUsers({ id }, token),
  );
  const fetchedUser = data?.data?.users[0] ?? null;

  // stateUser または fetchedUser または null
  const sourceUser = stateUser ?? fetchedUser ?? null;

  const initialDraft = useMemo(() => {
    if (!sourceUser) return;
    return toDraft(sourceUser);
  }, [sourceUser]);

  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  if (!sourceUser) return <NotFoundPage />;

  if (!draft || isLoading || isUpdateLoading) return <Loading />;

  const isDirty = !isEqual(
    normDraftForCompare(initialDraft),
    normDraftForCompare(draft),
  );

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const handleUpdateClick = async () => {
    const payload = {
      role: draft.role,
    };
    try {
      setIsUpdateLoading(true);
      const result = await updateUser(draft.id, payload, token);
      if (!result.success) {
        await confirm({
          title: "ユーザ情報の更新",
          message: [result.message],
          confirmLabel: "OK",
          cancelLabel: "閉じる",
          variant: "danger",
        });
        return;
      }
      await confirm({
        title: "ユーザ情報の更新",
        message: [result.message],
        confirmLabel: "OK",
        cancelLabel: "閉じる",
        variant: "primary",
      });
      navigateVT("/manage/user");
    } catch (e) {
      console.log(e);
      await confirm({
        title: "ユーザ情報の更新",
        message: ["エラーが発生しました", "管理者に問い合わせしてください"],
        confirmLabel: "OK",
        chacelLabel: "閉じる",
        variant: "danger",
      });
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const handleResetClick = () => {
    setDraft({
      ...initialDraft,
    });
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Edit User Page</p>
        <h2 className={styles.title}>ユーザの更新</h2>
        <p className={styles.sub}>
          ユーザ情報を更新して、最新の状態に保ちましょう。
        </p>
      </header>

      <div className={styles.content}>
        <aside className={styles.iconPanel}>
          <div className={styles.iconCard}>
            <div className={styles.iconImage}>
              <UserImage id={draft.id} />
            </div>
            <div className={styles.userName}>{draft?.name || "名無しさん"}</div>
          </div>
        </aside>
        <section className={styles.formCard}>
          <div>
            <p className={styles.eyebrow}>Detail</p>
            <h3>ユーザ情報</h3>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label>名前</label>
              <div className={styles.readonly}>{draft.name}</div>
            </div>
            <div className={styles.field}>
              <label>メールアドレス</label>
              <div className={styles.readonly}>{draft.email}</div>
            </div>
            <div className={styles.field}>
              <label>ロール</label>
              <select
                className={styles.select}
                name="role"
                value={draft.role}
                onChange={handleChange("role")}
              >
                <option value="admin">管理ユーザ</option>
                <option value="approver">承認ユーザ</option>
                <option value="general">一般ユーザ</option>
                <option value="lock">不可ユーザ</option>
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <ConfirmButton
              onClick={handleUpdateClick}
              variant="danger"
              confirmTitle="ユーザ情報の変更"
              confirmMessage={["ユーザ情報を変更しますか？"]}
              confirmLabel="保存"
              disabled={!isDirty}
            >
              保存
            </ConfirmButton>
            <ConfirmButton
              onClick={handleResetClick}
              variant="secondary"
              confirmTitle="変更の取り消し"
              confirmMessage={[
                "変更を取り消しますか？",
                "保存していない変更は失われます",
              ]}
              confirmLabel="取り消し"
              disabled={!isDirty}
            >
              取り消し
            </ConfirmButton>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UpdateUserPage;
