import sanitizeHtmlLibrary from "sanitize-html";

const ALLOWED_TAGS = [
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "pre", "hr", "br",
  "div", "span",
  "a", "strong", "em", "u", "s", "code", "sub", "sup",
  "img",
  "table", "thead", "tbody", "tr", "th", "td",
];

const ALLOWED_ATTRIBUTES = {
  "*": ["class"],
  a: ["href", "target", "rel"],
  img: ["src", "alt", "width", "height"],
};

export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLibrary(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesAppliedToAttributes: ["href", "src"],
    disallowedTagsMode: "completelyDiscard",
  });
}
