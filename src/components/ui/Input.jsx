/**
 * Input — UI Primitive
 * Hỗ trợ cả <input> và <textarea>
 *
 * Props: as="input"|"textarea", ...rest
 */
const baseClass = `
  w-full px-[14px] py-[11px]
  border-[1.5px] border-border-primary
  rounded-xl text-[14px] text-text-primary
  bg-bg-primary placeholder:text-text-muted
  outline-none resize-none
  font-[inherit]
  transition-[border,box-shadow] duration-200
  focus:border-pink-hot focus:bg-bg-secondary
  disabled:opacity-50 disabled:cursor-not-allowed
`;

// eslint-disable-next-line no-unused-vars
export default function Input({ as: Tag = "input", className = "", ...props }) {
  return (
    <Tag
      className={`${baseClass} ${className}`}
      {...props}
    />
  );
}
