import { Fragment } from "react";

import Button from "../button/Button";
import styles from "./ImageModal.module.css";
import Modal from "./Modal";

const ImageModal = ({ children, image, buttons = [] }) => {
  return (
    <Modal>
      {({ closeModal }) => {
        const closeButton = {
          label: "閉じる",
          onClick: closeModal,
          type: "button",
          variant: "secondary",
          disabled: false,
        };

        return (
          <div className={styles.root}>
            <div className={styles.image}>{image}</div>
            <div className={styles.main}>
              {children}

              <div className={styles.actions}>
                {buttons.map((button, i) => (
                  <Fragment key={i}>{button}</Fragment>
                ))}
                <Button
                  key={closeButton.label}
                  onClick={closeButton.onClick}
                  variant={closeButton.variant}
                  type={closeButton.type}
                  disabled={closeButton.disabled}
                >
                  {closeButton.label}
                </Button>
              </div>
            </div>
          </div>
        );
      }}
    </Modal>
  );
};

export default ImageModal;
