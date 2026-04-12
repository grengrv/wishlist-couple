import { createContext, useContext, useState, useCallback } from "react";
import ConfirmModal from "../components/ui/ConfirmModal";

const ConfirmContext = createContext();

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Xác nhận",
    cancelText: "Hủy bỏ",
    variant: "brand", // 'brand' | 'danger'
    resolve: null,
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title || "Xác nhận",
        message: options.message || "",
        confirmText: options.confirmText || "Xác nhận",
        cancelText: options.cancelText || "Hủy bỏ",
        variant: options.variant || "brand",
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    modalState.resolve(true);
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    modalState.resolve(false);
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmModal
        {...modalState}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
};
