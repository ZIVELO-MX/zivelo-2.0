"use client";

/**
 * Smooth-scrolls to an element on the same page without ever putting a
 * `#fragment` in the URL bar (unlike a plain `<a href="#id">`).
 */
export function ScrollToButton({
  targetId,
  className,
  children,
}: {
  targetId: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" })}
    >
      {children}
    </button>
  );
}
