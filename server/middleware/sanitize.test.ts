import { describe, it, expect } from "vitest";
import { sanitizeString } from "./sanitize";

describe("sanitizeString", () => {
  it("strips HTML tags from input", () => {
    expect(sanitizeString("<b>hello</b>")).toBe("hello");
    expect(sanitizeString("<script>alert('xss')</script>")).toBe("alert('xss')");
    expect(sanitizeString("<p>paragraph</p>")).toBe("paragraph");
  });

  it("strips nested and self-closing HTML tags", () => {
    expect(sanitizeString("<div><span>text</span></div>")).toBe("text");
    expect(sanitizeString("<br/>content<hr/>")).toBe("content");
    expect(sanitizeString("<img src='x' />image")).toBe("image");
  });

  it("limits output to 1000 characters", () => {
    const longInput = "a".repeat(2000);
    const result = sanitizeString(longInput);
    expect(result.length).toBe(1000);
  });

  it("strips tags before limiting length", () => {
    // Tags are stripped first, then length is limited
    const input = "<b>" + "a".repeat(1500) + "</b>";
    const result = sanitizeString(input);
    expect(result.length).toBe(1000);
    expect(result).not.toContain("<");
    expect(result).not.toContain(">");
  });

  it("returns input unchanged when no tags and under limit", () => {
    expect(sanitizeString("hello world")).toBe("hello world");
    expect(sanitizeString("مرحبا بالعالم")).toBe("مرحبا بالعالم");
  });

  it("handles empty string", () => {
    expect(sanitizeString("")).toBe("");
  });

  it("handles string with only HTML tags", () => {
    expect(sanitizeString("<div></div><span></span>")).toBe("");
  });

  it("preserves content between tags", () => {
    expect(sanitizeString("before<tag>middle</tag>after")).toBe("beforemiddleafter");
  });
});
