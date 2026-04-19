import { useState } from "react";

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
  const isSm = size === "sm";

  // Hiển thị ảnh nếu có src và không bị lỗi load
  if (src && !imgError) {
    return (
      <img 
        key={src}
        src={src} 
        alt="avatar" 
        onError={() => setImgError(true)}
        className={`
          ${sizes[size]} 
          rounded-full object-cover shrink-0
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
      className={`
        ${sizes[size]} 
        rounded-full shrink-0
        bg-gradient-avatar text-white font-bold
        flex items-center justify-center
        ${className}
      `}
      {...props}
    >
      {initial}
    </div>
  );
}
