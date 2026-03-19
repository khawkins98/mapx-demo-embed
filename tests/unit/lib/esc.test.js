import { describe, it, expect } from "vitest";
import { esc } from "../../../src/lib/esc.js";

describe("esc", () => {
  it("escapes HTML entities", () => {
    expect(esc("a & b")).toBe("a &amp; b");
    expect(esc("<div>")).toBe("&lt;div&gt;");
    expect(esc('"hello"')).toBe("&quot;hello&quot;");
    expect(esc("it's")).toBe("it&#39;s");
  });

  it("escapes XSS vectors", () => {
    expect(esc('<script>alert(1)</script>')).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(esc('" onload="alert(1)')).toBe("&quot; onload=&quot;alert(1)");
    expect(esc("'><img src=x onerror=alert(1)>")).toBe(
      "&#39;&gt;&lt;img src=x onerror=alert(1)&gt;",
    );
  });

  it("handles null, undefined, and numbers", () => {
    expect(esc(null)).toBe("null");
    expect(esc(undefined)).toBe("undefined");
    expect(esc(42)).toBe("42");
    expect(esc(0)).toBe("0");
  });

  it("returns empty string for empty string", () => {
    expect(esc("")).toBe("");
  });

  it("passes through safe strings unchanged", () => {
    expect(esc("hello world")).toBe("hello world");
    expect(esc("abc123")).toBe("abc123");
  });
});
