/**
 * Button — UI Primitive
 *
 * variants: "primary" | "outline" | "ghost" | "danger"
 * size:     "sm" | "md" (default)
 */
const variants = {
  primary: "bg-gradient-brand text-white font-semibold hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:bg-pink-light disabled:opacity-100 disabled:cursor-not-allowed disabled:translate-y-0",
  outline: "bg-white text-pink-brand border-[1.5px] border-pink-light hover:bg-pink-pale hover:border-pink-brand disabled:opacity-50 disabled:cursor-not-allowed",
  ghost: "bg-white text-pink-soft border-[1.5px] border-dashed border-pink-light hover:bg-pink-faint hover:border-pink-brand hover:text-pink-brand disabled:opacity-50 disabled:cursor-not-allowed",
  danger: "bg-pink-pale text-pink-brand border-[1.5px] border-pink-light hover:bg-[#fce4ec] hover:border-pink-brand disabled:opacity-50 disabled:cursor-not-allowed",
};

const sizes = {
  sm: "px-[14px] py-[7px] text-[13px]",
  md: "w-full py-[13px] text-[15px]",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  return (
    <button
      className={`
        ${sizes[size]}
        ${variants[variant]}
        rounded-xl font-medium cursor-pointer
        transition-all duration-150
        tracking-[0.2px]
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
