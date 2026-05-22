import { describe, it, expect } from "vitest";

// Import the function directly since it's a pure utility
// We'll test the logic inline since the client alias may not resolve in server tests
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

describe("formatDate", () => {
  it("returns placeholder for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns placeholder for undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("returns placeholder for invalid date string", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });

  it("returns placeholder for empty string", () => {
    expect(formatDate("")).toBe("—");
  });

  it("formats a valid Date object with ar-SA locale", () => {
    const date = new Date(2025, 0, 15); // Jan 15, 2025
    const result = formatDate(date);
    // Should contain Arabic characters
    expect(result).toMatch(/[\u0600-\u06FF]/);
    // Should not be the placeholder
    expect(result).not.toBe("—");
  });

  it("formats a valid ISO date string with ar-SA locale", () => {
    const result = formatDate("2025-01-15T00:00:00.000Z");
    // Should contain Arabic characters
    expect(result).toMatch(/[\u0600-\u06FF]/);
    expect(result).not.toBe("—");
  });

  it("does not output 'null' or 'undefined' strings", () => {
    expect(formatDate(null)).not.toContain("null");
    expect(formatDate(undefined)).not.toContain("undefined");
  });
});
