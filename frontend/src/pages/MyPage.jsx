import { useLocation } from "react-router-dom";

import Button from "../components/button/Button";
import UserImage from "../components/user/UserImage";
import useAuth from "../hooks/useAuth";
import useNavigateWithViewTransition from "../hooks/useNavigateWithViewTransition";
import styles from "./MyPage.module.css";

const MyPage = () => {
  const location = useLocation();
  const navigateVT = useNavigateWithViewTransition();
  const { user, signOut } = useAuth();

  const handleEditName = () => {
    navigateVT("/my-page/edit/name", {
      state: { backgroundLocation: location },
    });
  };

  const handleEditEmail = () => {
    navigateVT("/my-page/edit/email", {
      state: { backgroundLocation: location },
    });
  };

  const handleEditPassword = () => {
    navigateVT("/my-page/edit/password", {
      state: { backgroundLocation: location },
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigateVT("/");
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.pageName}>
          <p className={styles.eyebrow}>MyPage</p>
          <h2 className={styles.title}>マイページ</h2>
        </div>
      </header>
      <div className={styles.content}>
        <aside className={styles.aside}>
          <div className={styles.image}>
            <UserImage id={user?.id} />
          </div>
          <div className={styles.button}>
            <Button onClick={handleSignOut}>サインアウト</Button>
          </div>
        </aside>
        <section className={styles.main}>
          <div>
            <p className={styles.eyebrow}>Detail</p>
            <h3>ユーザ情報</h3>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label>名前</label>
              <div className={styles.readonly}>{user?.name}</div>
              <div className={styles.button}>
                <Button onClick={handleEditName}>プロフィールを編集</Button>
              </div>
            </div>
            <div className={styles.field}>
              <label>Email</label>
              <div className={styles.readonly}>{user?.email}</div>
              <div className={styles.button}>
                <Button onClick={handleEditEmail}>メールアドレスを編集</Button>
              </div>
            </div>
            <div className={styles.field}>
              <label>Password</label>
              <div className={styles.readonly}>*****</div>
              <div className={styles.button}>
                <Button onClick={handleEditPassword}>パスワードを編集</Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MyPage;
