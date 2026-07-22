import DOMPurify, { type Config } from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "pre", "hr", "br",
  "div", "span",
  "a", "strong", "em", "u", "s", "code", "sub", "sup",
  "img",
  "table", "thead", "tbody", "tr", "th", "td",
];

const ALLOWED_ATTRS = [
  "href", "target", "rel",
  "src", "alt", "width", "height",
  "class",
];

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRS,
    ALLOW_DATA_ATTR: false,
    FORBID_PROTOCOLS: ["javascript:", "data:"],
  } as Config);
}
