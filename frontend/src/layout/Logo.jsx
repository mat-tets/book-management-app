import logo from "../assets/logo.png";
import useNavigateWithViewTransition from "../hooks/useNavigateWithViewTransition";
import styles from "./Logo.module.css";

const Logo = () => {
  const navigateVT = useNavigateWithViewTransition();
  const handleClick = () => {
    navigateVT("/");
  };
  return (
    <h1 className={styles.logo} onClick={handleClick}>
      <img src={logo} alt="" />
      <span>BookMap</span>
    </h1>
  );
};

export default Logo;
