import { Modal } from "antd";
import { useState } from "react";
import type { ReactNode } from "react";

interface ConfirmModalProps {
  title?: string;
  message: ReactNode;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
  children?: (open: () => void) => ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title = "Confirm",
  message,
  okText = "OK",
  cancelText = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    onCancel?.();
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {children?.(handleOpen)}
      <Modal
        open={open}
        title={title}
        okText={okText}
        cancelText={cancelText}
        okButtonProps={{ danger, loading }}
        onOk={handleConfirm}
        onCancel={handleClose}
      >
        <p>{message}</p>
      </Modal>
    </>
  );
};

export { ConfirmModal };
export default ConfirmModal;
