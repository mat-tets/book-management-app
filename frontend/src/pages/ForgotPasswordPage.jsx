import { useState } from "react";

import { forgotPassword } from "../api/auth";
import ConfirmButton from "../components/button/ConfirmButton";
import useConfirm from "../hooks/useConfirm";
import useNavigateWithViewTransition from "../hooks/useNavigateWithViewTransition";
import styles from "./ForgotPasswordPage.module.css";

const ForgotPasswordPage = () => {
  const navigateVT = useNavigateWithViewTransition();
  const { confirm } = useConfirm();
  const [email, setEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async () => {
    if (!email) return;

    const payload = {
      email,
    };
    try {
      setIsLoading(true);
      const result = await forgotPassword(payload);
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
        <p className={styles.eyebrow}>Confirm Email Address</p>
        <h2 className={styles.title}>メールアドレスの確認</h2>
        <p className={styles.sub}>
          入力したメールアドレスにパスワード再設定メールを送信します。
        </p>
      </header>

      <div className={styles.content}>
        <section className={styles.formCard}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.required}>
              メールアドレス
            </label>
            <input
              id="email"
              className={styles.textInput}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <ConfirmButton
              onClick={handleResend}
              variant="primary"
              confirmTitle="パスワードの再設定"
              confirmMessage={[
                "パスワードの再設定メールを以下のメールアドレスに送信します",
                `メールアドレス: ${email}`,
              ]}
              confirmLabel="送信"
              disabled={!email}
            >
              送信する
            </ConfirmButton>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
