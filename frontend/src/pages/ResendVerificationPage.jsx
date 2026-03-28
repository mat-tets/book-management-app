import { useState } from "react";

import { resendVerification } from "../api/auth.js";
import ConfirmButton from "../components/button/ConfirmButton";
import useConfirm from "../hooks/useConfirm";
import useNavigateWithViewTransition from "../hooks/useNavigateWithViewTransition";
import styles from "./ResendVerificationPage.module.css";

const ResendVerificationPage = () => {
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
      const result = await resendVerification(payload);
      if (!result.success) {
        await confirm({
          title: "認証メールの再送",
          message: [result.message],
          confirmLabel: "OK",
          cancelLabel: "閉じる",
          variant: "danger",
        });
        return;
      }
      await confirm({
        title: "認証メールの再送",
        message: [result.message],
        confirmLabel: "OK",
        cancelLabel: "閉じる",
        variant: "primary",
      });
      navigateVT("/signin");
    } catch (e) {
      console.log(e);
      await confirm({
        title: "認証メールの再送",
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
      <div className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Resend Verification</p>
          <h2 className={styles.title}>認証メールの再送</h2>
          <p className={styles.sub}>
            入力したメールアドレスに認証メールを再送します。
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
                confirmTitle="認証メールの再送"
                confirmMessage={[
                  "認証メールを以下のメールアドレスに再送します",
                  `メールアドレス: ${email}`,
                ]}
                confirmLabel="送信"
                disabled={!email}
              >
                再送する
              </ConfirmButton>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ResendVerificationPage;
