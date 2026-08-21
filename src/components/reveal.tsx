"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type Ref,
} from "react";

function supportsViewTimeline() {
  return (
    typeof CSS !== "undefined" &&
    CSS.supports("(animation-timeline: view()) and (animation-range: entry)")
  );
}

const subscribeToViewTimelineSupport = () => () => {};
const getServerViewTimelineSupport = () => false;

/**
 * Mirrors the prototype's `.reveal` + IntersectionObserver behavior, but
 * prefers the native `animation-timeline: view()` CSS (see globals.css)
 * when supported, falling back to the observer only where it isn't (Firefox).
 */
export function Reveal({
  as: Tag = "div",
  delay,
  className = "",
  style,
  children,
}: {
  as?: "div" | "p";
  delay?: 1 | 2 | 3 | 4;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [isIn, setIsIn] = useState(false);
  const native = useSyncExternalStore(
    subscribeToViewTimelineSupport,
    supportsViewTimeline,
    getServerViewTimelineSupport,
  );

  useEffect(() => {
    if (native) return;
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setIsIn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIn(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [native]);

  const classes = ["reveal", className];
  if (isIn) classes.push("is-in");

  const revealProps = {
    className: classes.filter(Boolean).join(" "),
    style,
    "data-native": native ? "" : undefined,
    "data-d": delay,
  };

  if (Tag === "p") {
    return <p ref={ref as Ref<HTMLParagraphElement>} {...revealProps}>{children}</p>;
  }

  return <div ref={ref as Ref<HTMLDivElement>} {...revealProps}>{children}</div>;
}
