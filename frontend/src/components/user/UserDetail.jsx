import styles from "./UserDetail.module.css";

const roleMap = {
  lock: "不可ユーザ",
  general: "一般ユーザ",
  approver: "承認ユーザ",
  admin: "管理ユーザ",
};

const UserDetail = ({ user, opt = {} }) => {
  return (
    <div className={styles.root}>
      <div className={styles.detail}>
        {opt.name && (
          <div className={styles.field}>
            <label>名前</label>
            <div className={styles.readonly}>{user.name}</div>
          </div>
        )}
        {opt.name && (
          <div className={styles.field}>
            <label>メール</label>
            <div className={styles.readonly}>{user.email}</div>
          </div>
        )}
        {opt.role && (
          <div className={styles.field}>
            <label>ロール</label>
            <div className={styles.readonly}>{roleMap[user.role]}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
