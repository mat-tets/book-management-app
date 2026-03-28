import { useState } from "react";
import { Link } from "react-router-dom";

import { signUpUser } from "../api/auth";
import Button from "../components/button/Button";
import useConfirm from "../hooks/useConfirm";
import Loading from "../layout/Loading";
import styles from "./SignUpPage.module.css";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { confirm } = useConfirm();

  const [isRevealPassword, setIsRevealPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordToggle = () => {
    setIsRevealPassword((prevState) => !prevState);
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      name,
      email,
      password,
      confirmPassword,
    };
    try {
      setIsLoading(true);
      const result = await signUpUser(payload);
      if (!result.success) {
        await confirm({
          title: "サインアップ",
          message: [result.message],
          confirmLabel: "OK",
          cancelLabel: "閉じる",
          variant: "danger",
        });
        return;
      }
      await confirm({
        title: "サインアップ",
        message: [result.message],
        confirmLabel: "OK",
        cancelLabel: "閉じる",
        variant: "primary",
      });
    } catch (e) {
      console.log(e);
      await confirm({
        title: "サインアップ",
        message: ["エラーが発生しました", "管理者に問い合わせしてください"],
        confirmLabel: "OK",
        chacelLabel: "閉じる",
        variant: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className={styles.root}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <h3 className={styles.title}>Sign Up</h3>
          <p className={styles.sub}>
            アカウントを作成して、書籍を借りましょう！
          </p>
        </header>
        <div className={styles.content}>
          <form className={styles.main} onSubmit={handleRegisterSubmit}>
            <div className={styles.field}>
              <label htmlFor="name">名前</label>
              <input
                id="name"
                className={styles.textInput}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="email">メールアドレス</label>
              <input
                id="email"
                className={styles.textInput}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="password">パスワード</label>
              <input
                id="password"
                className={styles.textInput}
                type={isRevealPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="password">パスワード（確認）</label>
              <input
                id="password"
                className={styles.textInput}
                type={isRevealPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className={styles.opt}>
              <label className={styles.eyes}>
                <input
                  id="eyes"
                  type="checkbox"
                  onClick={handlePasswordToggle}
                  className={styles.PasswordReveal}
                />
                パスワードを表示する
              </label>
              <Link to="/resend-verification" className={styles.forgotPassword}>
                認証メールが届かない場合
              </Link>
            </div>
            <Button
              type="submit"
              disabled={!name || !email || !password || !confirmPassword}
            >
              サインアップ
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
