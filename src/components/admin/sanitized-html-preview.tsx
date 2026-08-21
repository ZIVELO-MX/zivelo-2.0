"use client";

import { createElement, useMemo, type ReactNode } from "react";

const ALLOWED_TAGS = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "pre", "hr", "br",
  "div", "span", "a", "strong", "em", "u", "s", "code", "sub", "sup",
  "img", "table", "thead", "tbody", "tr", "th", "td",
]);

const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

function isSafeUrl(value: string) {
  if (value.startsWith("/") || value.startsWith("#") || value.startsWith("?")) {
    return true;
  }
  try {
    return SAFE_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

function renderHtmlNode(node: ChildNode, key: string): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const element = node as Element;
  const tag = element.tagName.toLowerCase();
  const children = Array.from(element.childNodes).map((child, index) =>
    renderHtmlNode(child, `${key}-${index}`),
  );
  if (!ALLOWED_TAGS.has(tag)) return children;

  const props: Record<string, unknown> = { key };
  const className = element.getAttribute("class");
  if (className) props.className = className;

  if (tag === "a") {
    const href = element.getAttribute("href");
    if (href && isSafeUrl(href)) props.href = href;
    const target = element.getAttribute("target");
    if (target === "_blank") {
      props.target = target;
      props.rel = "noopener noreferrer";
    }
  }

  if (tag === "img") {
    const src = element.getAttribute("src");
    if (!src || !isSafeUrl(src)) return null;
    props.src = src;
    props.alt = element.getAttribute("alt") ?? "";
    for (const dimension of ["width", "height"] as const) {
      const value = Number(element.getAttribute(dimension));
      if (Number.isInteger(value) && value > 0) props[dimension] = value;
    }
  }

  return createElement(tag, props, ...children);
}

export function SanitizedHtmlPreview({ html }: { html: string }) {
  const content = useMemo(() => {
    if (typeof DOMParser === "undefined") return null;
    const document = new DOMParser().parseFromString(html, "text/html");
    return Array.from(document.body.childNodes).map((node, index) =>
      renderHtmlNode(node, `preview-${index}`),
    );
  }, [html]);

  return <div className="prose">{content}</div>;
}
