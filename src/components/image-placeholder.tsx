/**
 * Replaces the prototype's `<image-slot>` drag-and-drop dev tool (image-slot.js —
 * explicitly "no migra" per the handoff roadmap). Renders the same `.ph` visual
 * placeholder; swap for `next/image` once real screenshots/assets are provided.
 */
export function ImagePlaceholder({
  label,
  className = "",
  style,
}: {
  label: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`ph ${className}`} style={style}>
      <span className="ph__label">{label}</span>
    </div>
  );
}
