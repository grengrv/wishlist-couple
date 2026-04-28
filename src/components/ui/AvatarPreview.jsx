import { useEffect } from "react";

export default function AvatarPreview({ isOpen, src, name, onClose }) {
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

  const safeName = String(name || "?");
  const initial = (safeName[0] || "?").toUpperCase();

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[30000] p-4 animate-fade-in transition-all duration-300"
      onClick={onClose}
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-90"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div
        onClick={e => e.stopPropagation()}
        className="relative max-w-full max-h-full flex flex-col items-center animate-zoom-in"
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="max-w-[90vw] max-h-[70vh] rounded-2xl shadow-2xl border-4 border-white/10 object-contain"
          />
        ) : (
          <div className="w-48 h-48 rounded-full bg-gradient-avatar text-white text-[80px] font-black flex items-center justify-center shadow-2xl border-4 border-white/10">
            {initial}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <h3 className="text-white text-xl font-black tracking-tight drop-shadow-lg">
            {name}
          </h3>
          <p className="text-white/60 text-sm font-bold mt-1">
            Ảnh đại diện
          </p>
        </div>
      </div>
    </div>
  );
}
