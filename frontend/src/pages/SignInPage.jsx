import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import Button from "../components/button/Button";
import useAuth from "../hooks/useAuth";
import useConfirm from "../hooks/useConfirm";
import useNavigateWithViewTransition from "../hooks/useNavigateWithViewTransition";
import Loading from "../layout/Loading";
import styles from "./SignInPage.module.css";

const SignInPage = () => {
  const navigateVT = useNavigateWithViewTransition();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useAuth();
  const { confirm } = useConfirm();

  const [isRevealPassword, setIsRevealPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordToggle = () => {
    setIsRevealPassword((prevState) => !prevState);
  };

  const handleSignInSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      email,
      password,
    };
    try {
      setIsLoading(true);
      const result = await signIn(payload);
      if (!result.success) {
        await confirm({
          title: "サインイン",
          message: [result.message],
          confirmLabel: "OK",
          cancelLabel: "閉じる",
          variant: "danger",
        });
        return;
      }
      navigateVT(from, { replace: true });
    } catch (e) {
      console.log(e);
      await confirm({
        title: "サインイン",
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
          <h3 className={styles.title}>Sign In</h3>
          <p className={styles.sub}>サインインして、書籍を借りましょう！</p>
        </header>
        <div className={styles.content}>
          <form className={styles.main} onSubmit={handleSignInSubmit}>
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
              <Link to="/forgot-password" className={styles.forgotPassword}>
                パスワードを忘れた場合
              </Link>
            </div>
            <Button type="submit" disabled={!email || !password}>
              サインイン
            </Button>
          </form>
          <div className={styles.aside}>
            <Link to="/signup" className={styles.signUp}>
              アカウントを作成
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
