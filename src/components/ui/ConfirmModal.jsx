import { useEffect } from "react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  variant,
  onConfirm,
  onCancel
}) {
  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-[4px] flex items-center justify-center z-[20000] p-6 animate-fade-in"
      onClick={onCancel}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-[32px] w-full max-w-[400px] p-8 shadow-2xl animate-slide-up flex flex-col gap-6 relative overflow-hidden text-center"
      >
        {/* Decoration */}
        <div className={`absolute top-0 left-0 w-full h-1.5 ${variant === 'danger' ? 'bg-red-500' : 'bg-pink-brand'}`}></div>
        
        <div className="flex flex-col gap-3">
          <h3 className={`text-2xl font-black tracking-tight ${variant === 'danger' ? 'text-red-500' : 'text-pink-brand'}`}>
            {title}
          </h3>
          <p className="text-text-sub text-[15px] font-medium leading-relaxed opacity-80">
            {message}
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <button 
            onClick={onConfirm}
            className={`
              w-full h-13 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg
              ${variant === 'danger' 
                ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600' 
                : 'bg-gradient-brand text-white shadow-pink-brand/20 hover:scale-[1.02]'
              }
            `}
          >
            {confirmText}
          </button>
          <button 
            onClick={onCancel}
            className="w-full h-12 rounded-2xl font-bold text-pink-muted hover:bg-pink-faint hover:text-pink-brand transition-all active:scale-95 text-sm"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
坐坐坐+
