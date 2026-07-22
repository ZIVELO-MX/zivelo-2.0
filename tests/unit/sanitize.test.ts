import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeHtml } from "../../src/lib/sanitize";

const ALLOWED = {
  basic: "<p>Hello</p>",
  link: '<a href="https://zivelo.dev">Zivelo</a>',
  img: '<img src="https://zivelo.dev/logo.png" alt="Logo">',
  lists: "<ul><li>Item</li></ul>",
  headings: "<h2>Title</h2>",
  formatting: "<strong>Bold</strong> <em>Italic</em> <u>Underline</u>",
  code: "<code>const x = 1;</code>",
  table: "<table><tr><td>Cell</td></tr></table>",
};

const BLOCKED = {
  script: "<script>alert(1)</script>",
  iframe: "<iframe src='https://evil.com'></iframe>",
  object: "<object data='evil.swf'></object>",
  eventHandler: '<p onclick="alert(1)">Click</p>',
  javascriptUrl: '<a href="javascript:alert(1)">Evil</a>',
  dataUrl: '<img src="data:image/svg+xml,<script>alert(1)</script>" />',
  styleScript: "<div style='background:url(\"javascript:alert(1)\")'>X</div>",
};

test("sanitizeHtml allows safe HTML", () => {
  for (const [name, html] of Object.entries(ALLOWED)) {
    const result = sanitizeHtml(html);
    assert.ok(result.length > 0, `${name}: result is empty`);
    assert.ok(!result.includes("<script"), `${name}: script leaked: ${result}`);
    assert.ok(!result.includes("onerror"), `${name}: event handler leaked: ${result}`);
  }
});

test("sanitizeHtml blocks script tags", () => {
  const result = sanitizeHtml(BLOCKED.script);
  assert.ok(!result.includes("<script"), `script tag not removed: ${result}`);
  assert.ok(!result.includes("alert(1)"), `script content not removed: ${result}`);
});

test("sanitizeHtml blocks iframe tags", () => {
  const result = sanitizeHtml(BLOCKED.iframe);
  assert.ok(!result.includes("iframe"), `iframe not removed: ${result}`);
});

test("sanitizeHtml blocks object tags", () => {
  const result = sanitizeHtml(BLOCKED.object);
  assert.ok(!result.includes("object"), `object not removed: ${result}`);
});

test("sanitizeHtml removes event handler attributes", () => {
  const result = sanitizeHtml(BLOCKED.eventHandler);
  assert.ok(!result.includes("onclick"), `onclick not removed: ${result}`);
  assert.ok(result.includes("<p>"), "paragraph content should remain");
  assert.ok(result.includes("Click"), "text content should remain");
});

test("sanitizeHtml blocks javascript: URLs", () => {
  const result = sanitizeHtml(BLOCKED.javascriptUrl);
  assert.ok(!result.includes("javascript:"), `javascript: not blocked: ${result}`);
});

test("sanitizeHtml blocks data: URLs in images", () => {
  const result = sanitizeHtml(BLOCKED.dataUrl);
  assert.ok(!result.includes("data:"), `data: not blocked: ${result}`);
});

test("sanitizeHtml handles empty and non-string input", () => {
  assert.equal(sanitizeHtml(""), "");
  assert.equal(sanitizeHtml("<p>Only text</p>"), "<p>Only text</p>");
});

test("sanitizeHtml strips unknown attributes", () => {
  const result = sanitizeHtml('<p id="test" data-x="y">Hello</p>');
  assert.ok(!result.includes("data-x"), "data-x should be stripped");
  assert.ok(result.includes("Hello"), "text should remain");
});
