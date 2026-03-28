import { useEffect, useRef, useState } from "react";

import Button from "../button/Button";
import styles from "./ConfirmDialog.module.css";

const ConfirmDialog = ({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  variant,
  requiredText = "",
  inputPlaceholder = "",
}) => {
  const dialogRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const hasRequiredText = Boolean(requiredText);
  const canConfirm =
    !hasRequiredText || inputValue.trim() === requiredText.trim();

  // ダイアログ表示の初期化
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
  }, []);

  // ダイアログ外のクリックで閉じる
  const handleClickBackDrop = (e) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClick={handleClickBackDrop}
      onCancel={() => onCancel()}
    >
      <div className={styles.root}>
        <div className={styles.confirm}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.message}>
            {message.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            {hasRequiredText && (
              <div className={styles.message}>
                <p className={styles.inputHint}>
                  確認のため「{requiredText}」を入力してください
                </p>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={inputPlaceholder || requiredText}
                  className={styles.input}
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>
        <div className={styles.actions}>
          <Button variant={variant} onClick={onConfirm} disabled={!canConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmDialog;
