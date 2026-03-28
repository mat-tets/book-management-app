import { useState } from "react";

import ConfirmDialog from "../components/dialog/ConfirmDialog";
import ConfirmContext from "./ConfirmContext";

const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({
    open: false,
    title: "",
    message: [],
    confirmLabel: "OK",
    cancelLabel: "キャンセル",
    requiredText: "",
    inputPlaceholder: "",
    resolve: null,
    variant: "danger",
  });

  const confirm = (opts = {}) => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: opts.title ?? "",
        message: Array.isArray(opts.message)
          ? opts.message
          : [opts.message ?? "本当に実行しますか？"],
        confirmLabel: opts.confirmLabel ?? "OK",
        cancelLabel: opts.cancelLabel ?? "キャンセル",
        requiredText: opts.requiredText ?? "",
        inputPlaceholder: opts.inputPlaceholder ?? "",
        variant: opts.variant ?? "danger",
        resolve,
      });
    });
  };

  // ダイアログを閉じる
  const close = (result) => {
    setState((prevState) => {
      // Confirmを押下したらtrue Cancelを押下したらfalseを返す
      prevState.resolve?.(result);

      return { ...prevState, open: false, resolve: null };
    });
  };

  return (
    <ConfirmContext value={{ confirm }}>
      {children}
      {state.open && (
        <ConfirmDialog
          title={state.title}
          message={state.message}
          confirmLabel={state.confirmLabel}
          cancelLabel={state.cancelLabel}
          onConfirm={() => close(true)}
          onCancel={() => close(false)}
          variant={state.variant}
          requiredText={state.requiredText}
          inputPlaceholder={state.inputPlaceholder}
        />
      )}
    </ConfirmContext>
  );
};

export default ConfirmProvider;
