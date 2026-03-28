import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { resetPassword } from "../api/auth";
import ConfirmButton from "../components/button/ConfirmButton";
import useConfirm from "../hooks/useConfirm";
import useNavigateWithViewTransition from "../hooks/useNavigateWithViewTransition";
import Loading from "../layout/Loading";
import NotFoundPage from "./NotFoundPage";
import styles from "./ResetPasswordPage.module.css";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigateVT = useNavigateWithViewTransition();
  const { confirm } = useConfirm();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isRevealPassword, setIsRevealPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  if (!searchParams.get("token")) {
    return <NotFoundPage />;
  }

  if (isLoading) return <Loading />;

  const handlePasswordToggle = () => {
    setIsRevealPassword((prevState) => !prevState);
  };

  const handlePasswordReset = async () => {
    if (!password || !confirmPassword) return;

    const token = searchParams.get("token");
    const payload = {
      password,
      confirmPassword,
      token,
    };
    try {
      setIsLoading(true);
      const result = await resetPassword(payload);
      if (!result.success) {
        await confirm({
          title: "パスワードの再設定",
          message: [result.message],
          confirmLabel: "OK",
          cancelLabel: "閉じる",
          variant: "danger",
        });
        return;
      }
      await confirm({
        title: "パスワードの再設定",
        message: [result.message],
        confirmLabel: "OK",
        cancelLabel: "閉じる",
        variant: "primary",
      });
      navigateVT("/signin");
    } catch (e) {
      console.log(e);
      await confirm({
        title: "パスワードの再設定",
        message: ["エラーが発生しました", "管理者に問い合わせしてください"],
        confirmLabel: "OK",
        chacelLabel: "閉じる",
        variant: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Reconfigure Password</p>
        <h2 className={styles.title}>パスワードの再設定</h2>
        <p className={styles.sub}>パスワードを再設定します。</p>
      </header>

      <div className={styles.content}>
        <section className={styles.formCard}>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.required}>
              パスワード
            </label>
            <input
              id="password"
              className={styles.textInput}
              type={isRevealPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="confirmPassword" className={styles.required}>
              パスワード（確認）
            </label>
            <input
              id="confirmPassword"
              className={styles.textInput}
              type={isRevealPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label className={styles.eyes}>
              <input
                id="eyes"
                type="checkbox"
                onClick={handlePasswordToggle}
                className={styles.PasswordReveal}
              />
              パスワードを表示する
            </label>
          </div>

          <div className={styles.actions}>
            <ConfirmButton
              onClick={handlePasswordReset}
              variant="primary"
              confirmTitle="パスワードの再設定"
              confirmMessage={["パスワードの再設定を行います。"]}
              confirmLabel="再設定"
              disabled={!password || !confirmPassword}
            >
              再設定
            </ConfirmButton>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
