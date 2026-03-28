import useConfirm from "../../hooks/useConfirm";
import Button from "./Button";

const ConfirmButton = ({
  children,
  onClick,
  variant = "danger",
  confirmTitle = "",
  confirmMessage = "本当に実行しますか？",
  confirmLabel = "実行",
  cancelLabel = "キャンセル",
  ...buttonProps
}) => {
  const { confirm } = useConfirm();

  const handleClick = async (e) => {
    const ok = await confirm({
      title: confirmTitle,
      message: confirmMessage,
      confirmLabel,
      cancelLabel,
      variant,
    });
    if (!ok) return;
    onClick?.(e);
  };

  return (
    <Button onClick={handleClick} variant={variant} {...buttonProps}>
      {children}
    </Button>
  );
};

export default ConfirmButton;
