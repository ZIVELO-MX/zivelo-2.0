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

const FORBIDDEN_PROTOCOLS = ["javascript:", "data:"];

function hasForbiddenProtocol(value: string): boolean {
  const val = value.trim().toLowerCase();
  return FORBIDDEN_PROTOCOLS.some((p) => val.startsWith(p));
}

DOMPurify.addHook("uponSanitizeAttribute", (node, data, config) => {
  if (
    data.attrName &&
    typeof data.attrValue === "string" &&
    hasForbiddenProtocol(data.attrValue)
  ) {
    data.keepAttr = false;
  }
});

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRS,
    ALLOW_DATA_ATTR: false,
  } as Config);
}
