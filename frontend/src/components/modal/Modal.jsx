import { useCallback, useEffect, useRef } from "react";

import useNavigateWithViewTransition from "../../hooks/useNavigateWithViewTransition";
import styles from "./Modal.module.css";

const Modal = ({ children }) => {
  const navigateVT = useNavigateWithViewTransition();
  const dialogRef = useRef(null);

  // モーダルを閉じる
  const closeModal = useCallback(() => {
    // dialogRef.current?.close();
    navigateVT(-1);
  }, [navigateVT]);

  // モーダル表示の初期化
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
  }, []);

  // モーダル外のクリックで閉じる
  const handleClickBackDrop = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClick={handleClickBackDrop}
      onCancel={(e) => {
        e.preventDefault();
        closeModal();
      }}
    >
      <div className={styles.root}>
        {typeof children === "function" ? children({ closeModal }) : children}
      </div>
    </dialog>
  );
};

export default Modal;
