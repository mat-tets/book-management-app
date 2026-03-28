import Avatar from "boring-avatars";

import styles from "./UserImage.module.css";

const UserImage = ({ id }) => {
  return (
    <div className={styles.image}>
      <Avatar
        name={id}
        colors={["#bfdbfe", "#fecaca", "#dbeafe", "#fee2e2", "#ffffff"]}
        variant="beam"
        size={80}
      />
    </div>
  );
  // return <img className={styles.image} src={userIcon} alt="プロフィール画像" />;
};

export default UserImage;
