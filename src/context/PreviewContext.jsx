import { createContext, useContext, useState, useCallback } from "react";
import AvatarPreview from "@components/ui/AvatarPreview";

const PreviewContext = createContext();

export const usePreview = () => {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error("usePreview must be used within a PreviewProvider");
  }
  return context;
};

export const PreviewProvider = ({ children }) => {
  const [previewState, setPreviewState] = useState({
    isOpen: false,
    src: null,
    name: "?",
  });

  const showPreview = useCallback((src, name) => {
    setPreviewState({
      isOpen: true,
      src,
      name: name || "?",
    });
  }, []);

  const closePreview = useCallback(() => {
    setPreviewState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <PreviewContext.Provider value={showPreview}>
      {children}
      <AvatarPreview
        isOpen={previewState.isOpen}
        src={previewState.src}
        name={previewState.name}
        onClose={closePreview}
      />
    </PreviewContext.Provider>
  );
};
