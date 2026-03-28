import noImage from "../../assets/no-image.png";
import styles from "./BookImage.module.css";

const BookImage = ({ title, coverUrl }) => {
  return (
    <img
      className={styles.image}
      src={coverUrl || noImage}
      alt={title}
      onError={(e) => {
        e.target.src = noImage;
      }}
    />
  );
};

export default BookImage;
