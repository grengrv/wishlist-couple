import { useState } from "react";
import { usePreview } from "@context/PreviewContext";

/**
 * Avatar — UI Primitive
 * 
 * src: URL hình ảnh (nếu có)
 * name: Tên người dùng để lấy fallback chữ cái đầu (nếu ko có src)
 * size: "sm" | "md" | "lg"
 */

const sizes = {
  xs: "w-[20px] h-[20px] text-[9px]",
  sm: "w-[22px] h-[22px] text-[10px]",
  md: "w-[38px] h-[38px] text-[16px] border-2", // Dành cho admin-bar
  lg: "w-[110px] h-[110px] text-[42px] border-[3px]" // Dành cho upload 
};

export default function Avatar({ src, name = "?", size = "sm", className = "", ...props }) {
  const [imgError, setImgError] = useState(false);
  const showPreview = usePreview();
  const isSm = size === "sm";

  const handlePreview = (e) => {
    e.stopPropagation();
    showPreview(src, name);
  };

  // Hiển thị ảnh nếu có src và không bị lỗi load
  if (src && !imgError) {
    return (
      <img 
        key={src}
        src={src} 
        alt="avatar" 
        onClick={handlePreview}
        onError={() => setImgError(true)}
        className={`
          ${sizes[size]} 
          rounded-full object-cover shrink-0
          cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300
          ${isSm ? "border-[1.5px] border-pink-light" : "border-pink-light"}
          ${className}
        `}
        {...props}
      />
    );
  }

  // Fallback Initials (Chữ cái đầu)
  // Bảo vệ tránh crash khi name là null/undefined
  const safeName = String(name || "?");
  const initial = (safeName[0] || "?").toUpperCase();

  return (
    <div 
      onClick={handlePreview}
      className={`
        ${sizes[size]} 
        rounded-full shrink-0
        bg-gradient-avatar text-white font-bold
        flex items-center justify-center
        cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300
        ${className}
      `}
      {...props}
    >
      {initial}
    </div>
  );
}
