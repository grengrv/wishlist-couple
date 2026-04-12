/**
 * Input — UI Primitive
 * Hỗ trợ cả <input> và <textarea>
 *
 * Props: as="input"|"textarea", ...rest
 */
const baseClass = `
  w-full px-[14px] py-[11px]
  border-[1.5px] border-pink-border
  rounded-xl text-[14px] text-text-base
  bg-pink-faint placeholder:text-pink-muted
  outline-none resize-none
  font-[inherit]
  transition-[border,box-shadow] duration-200
  focus:border-pink-hot focus:bg-white
  focus:shadow-[0_0_0_3px_rgba(233,30,140,0.08)]
  disabled:opacity-50 disabled:cursor-not-allowed
`;

export default function Input({ as: Tag = "input", className = "", ...props }) {
  return (
    <Tag
      className={`${baseClass} ${className}`}
      {...props}
    />
  );
}
