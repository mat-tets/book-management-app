import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { updateMyPassword, updateMyProfile } from "../../api/user";
import useAuth from "../../hooks/useAuth";
import useConfirm from "../../hooks/useConfirm";
import Loading from "../../layout/Loading";
import Button from "../button/Button";
import ConfirmButton from "../button/ConfirmButton";
import Modal from "../modal/Modal";
import styles from "./EditUserModal.module.css";

const eybrowMap = {
  name: "Edit Name",
  email: "Edit Email",
  password: "Edit Password",
};

const titleMap = {
  name: "名前",
  email: "メールアドレス",
  password: "パスワード",
};

const EditUserModal = () => {
  const { type } = useParams();
  const { user, token, updateUser } = useAuth();
  const { confirm } = useConfirm();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isRevealPassword, setIsRevealPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const mode = useMemo(() => {
    if (type === "name") return "name";
    if (type === "email") return "email";
    if (type === "password") return "password";
    return null;
  }, [type]);

  const isDirty = useMemo(() => {
    if (!user) return false;
    if (mode === "name")
      return name.trim() !== "" && name.trim() !== (user.name ?? "");
    if (mode === "email")
      return email.trim() !== "" && email.trim() !== (user.email ?? "");
    if (mode === "password")
      return currentPassword !== "" && newPassword !== "";
    return false;
  }, [user, mode, name, email, currentPassword, newPassword]);

  if (!user || !mode || isLoading) return <Loading />;

  const handlePasswordToggle = () => {
    setIsRevealPassword((prevState) => !prevState);
  };

  const handleSaveClick = async (closeModal) => {
    try {
      setIsLoading(true);
      if (mode === "name") {
        const result = await updateMyProfile({ name: name.trim() }, token);
        if (!result.success) {
          await confirm({
            title: `${titleMap[mode]}の変更`,
            message: [result.message],
            confirmLabel: "OK",
            cancelLabel: "閉じる",
            variant: "danger",
          });
          return;
        }
        updateUser({ name: name.trim() });
        await confirm({
          title: `${titleMap[mode]}の変更`,
          message: [result.message],
          confirmLabel: "OK",
          cancelLabel: "閉じる",
          variant: "primary",
        });
        closeModal();
      }

      if (mode === "email") {
        const result = await updateMyProfile({ email: email.trim() }, token);
        if (!result.success) {
          await confirm({
            title: `${titleMap[mode]}の変更`,
            message: [result.message],
            confirmLabel: "OK",
            cancelLabel: "閉じる",
            variant: "danger",
          });
          return;
        }
        updateUser({ email: email.trim() });
        await confirm({
          title: `${titleMap[mode]}の変更`,
          message: [result.message],
          confirmLabel: "OK",
          cancelLabel: "閉じる",
          variant: "primary",
        });
        closeModal();
      }

      if (mode === "password") {
        const result = await updateMyPassword(
          { currentPassword, newPassword, confirmPassword },
          token,
        );
        if (!result.success) {
          await confirm({
            title: `${titleMap[mode]}の変更`,
            message: [result.message],
            confirmLabel: "OK",
            cancelLabel: "閉じる",
            variant: "danger",
          });
          return;
        }
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        await confirm({
          title: `${titleMap[mode]}の変更`,
          message: [result.message],
          confirmLabel: "OK",
          cancelLabel: "閉じる",
          variant: "primary",
        });
        closeModal();
      }
    } catch (e) {
      console.log(e);
      await confirm({
        title: `${titleMap[mode]}の変更`,
        message: ["エラーが発生しました", "管理者に問い合わせしてください"],
        confirmLabel: "OK",
        cancelLabel: "閉じる",
        variant: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal>
      {({ closeModal }) => (
        <div className={styles.root}>
          <div className={styles.header}>
            <p className={styles.eyebrow}>{eybrowMap[mode]}</p>
            <h3 className={styles.title}>{`${titleMap[mode]}の変更`}</h3>
          </div>
          <div className={styles.content}>
            <div className={styles.form}>
              {mode === "name" && (
                <label className={styles.field}>
                  新しい名前
                  <input
                    className={styles.textInput}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              )}
              {mode === "email" && (
                <label className={styles.field}>
                  新しいメールアドレス
                  <input
                    className={styles.textInput}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              )}
              {mode === "password" && (
                <>
                  <label className={styles.field}>
                    既存のパスワード
                    <input
                      className={styles.textInput}
                      type={isRevealPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    新しいパスワード
                    <input
                      className={styles.textInput}
                      type={isRevealPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    パスワードの確認
                    <input
                      className={styles.textInput}
                      type={isRevealPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </label>
                  <label className={styles.eyes}>
                    <input
                      id="eyes"
                      type="checkbox"
                      onClick={handlePasswordToggle}
                      className={styles.PasswordReveal}
                    />
                    パスワードを表示する
                  </label>
                </>
              )}
            </div>
            <div className={styles.actions}>
              <ConfirmButton
                onClick={() => handleSaveClick(closeModal)}
                variant="primary"
                confirmTitle={`${titleMap[mode]}の変更`}
                confirmMessage={[`${titleMap[mode]}を変更しますか？`]}
                confirmLabel="変更"
                disabled={!isDirty}
              >
                変更
              </ConfirmButton>
              <Button variant="secondary" onClick={closeModal}>
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default EditUserModal;
