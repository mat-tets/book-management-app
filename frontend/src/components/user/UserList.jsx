import { useLocation } from "react-router-dom";

import useNavigateWithViewTransition from "../../hooks/useNavigateWithViewTransition";
import UserDetail from "./UserDetail";
import UserImage from "./UserImage";
import styles from "./UserList.module.css";

const UserList = ({ users }) => {
  const location = useLocation();
  const navigateVT = useNavigateWithViewTransition();

  const navigateUserModal = (user) => {
    navigateVT(`/manage/user/${user.id}`, {
      state: { user, backgroundLocation: location },
    });
  };

  if (!users) return;

  if (users.length === 0) return <h3>ユーザはいません。</h3>;

  return (
    <ul className={styles.root}>
      {users.map((user) => (
        <li
          key={user.id}
          className={styles.list}
          onClick={() => navigateUserModal(user)}
        >
          <div className={styles.image}>
            <UserImage id={user.id} />
          </div>
          <div className={styles.main}>
            <UserDetail
              user={user}
              opt={{ name: true, email: true, role: true }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default UserList;
