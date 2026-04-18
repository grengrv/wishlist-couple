/**
 * Avatar — UI Primitive
 * 
 * src: URL hình ảnh (nếu có)
 * name: Tên người dùng để lấy fallback chữ cái đầu (nếu ko có src)
 * size: "sm" | "lg"
 */

const sizes = {
  sm: "w-[22px] h-[22px] text-[10px]",
  md: "w-[38px] h-[38px] text-[16px] border-2", // Dành cho admin-bar
  lg: "w-[110px] h-[110px] text-[42px] border-[3px]" // Dành cho upload 
};

export default function Avatar({ src, name = "?", size = "sm", className = "", ...props }) {
  const isSm = size === "sm";

  if (src) {
    return (
      <img 
        key={src}
        src={src} 
        alt="avatar" 
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

  // Fallback Initials
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
      {(name[0] || "?").toUpperCase()}
    </div>
  );
}
