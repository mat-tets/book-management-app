import { useState } from "react";

import { registerUser } from "../api/user";
import noImage from "../assets/no-image.png";
import Button from "../components/button/Button";
import ConfirmButton from "../components/button/ConfirmButton";
import useAuth from "../hooks/useAuth";
import useConfirm from "../hooks/useConfirm";
import useNavigateWithViewTransition from "../hooks/useNavigateWithViewTransition";
import Loading from "../layout/Loading";
import styles from "./RegisterUserPage.module.css";

const generatePassword = (length) => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((value) => characters[value % characters.length])
    .join("");
};

const initialDraft = {
  name: "",
  email: "",
  password: "",
  role: "general",
};

const roleMap = {
  lock: "不可ユーザ",
  general: "一般ユーザ",
  approver: "承認ユーザ",
  admin: "管理ユーザ",
};

const RegisterUserPage = () => {
  const navigateVT = useNavigateWithViewTransition();

  const { token } = useAuth();
  const { confirm } = useConfirm();

  const [draft, setDraft] = useState(initialDraft);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const isDirty =
    draft &&
    ((initialDraft.name ?? "") !== (draft.name ?? "") ||
      (initialDraft.email ?? "") !== (draft.email ?? "") ||
      (initialDraft.password ?? "") !== (draft.password ?? "") ||
      (initialDraft.role ?? "") !== (draft.role ?? ""));

  const handleUpdate = async () => {
    if (!draft) return;

    const payload = {
      name: draft.name,
      email: draft.email,
      password: draft.password,
      role: draft.role,
    };
    try {
      setIsLoading(true);
      const result = await registerUser(payload, token);
      if (!result.success) {
        await confirm({
          title: "ユーザ情報の登録",
          message: [result.message],
          confirmLabel: "OK",
          cancelLabel: "閉じる",
          variant: "danger",
        });
        return;
      }
      await confirm({
        title: "ユーザ情報の登録",
        message: [
          result.message,
          `ユーザ名: ${draft.name}`,
          `メールアドレス: ${draft.email}`,
          `パスワード: ${draft.password}`,
          `ロール: ${roleMap[draft.role]}`,
        ],
        confirmLabel: "OK",
        cancelLabel: "閉じる",
        variant: "primary",
      });
      navigateVT("/manage/user");
    } catch (e) {
      console.log(e);
      await confirm({
        title: "ユーザ情報の登録",
        message: ["エラーが発生しました", "管理者に問い合わせしてください"],
        confirmLabel: "OK",
        chacelLabel: "閉じる",
        variant: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDraft({
      name: initialDraft.name,
      email: initialDraft.email,
      password: initialDraft.password,
      role: initialDraft.role,
    });
  };

  if (!draft || isLoading || isLoading) return <Loading />;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Edit User Page</p>
        <h2 className={styles.title}>ユーザの追加</h2>
        <p className={styles.sub}>
          アプリケーションを利用するユーザを登録しましょう。
        </p>
      </header>

      <div className={styles.content}>
        <aside className={styles.iconPanel}>
          <div className={styles.iconCard}>
            <div className={styles.iconImage}>
              <img src={noImage} />
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
              <label htmlFor="name" className={styles.required}>
                名前
              </label>
              <input
                id="name"
                className={styles.textInput}
                type="text"
                value={draft.name}
                onChange={handleChange("name")}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.required}>
                メールアドレス
              </label>
              <input
                id="email"
                className={styles.textInput}
                type="email"
                value={draft.email}
                onChange={handleChange("email")}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="password" className={styles.required}>
                パスワード
              </label>
              <div className={styles.password}>
                <input
                  id="password"
                  className={styles.textInput}
                  type="text"
                  value={draft.password}
                  onChange={handleChange("password")}
                />
                <Button
                  onClick={() =>
                    setDraft((d) => ({ ...d, password: generatePassword(8) }))
                  }
                >
                  自動生成
                </Button>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.required}>ロール</label>
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
              onClick={handleUpdate}
              variant="danger"
              confirmTitle="ユーザ情報の登録"
              confirmMessage={["ユーザ情報を登録しますか？"]}
              confirmLabel="保存"
              disabled={!isDirty}
            >
              保存
            </ConfirmButton>
            <ConfirmButton
              onClick={handleReset}
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

export default RegisterUserPage;
