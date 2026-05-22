import { describe, it, expect } from "vitest";
import fc from "fast-check";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Property 3: Token Contrast Compliance
 *
 * For every semantic color pair (foreground, background) defined in the Design_System,
 * the computed contrast ratio SHALL be ≥ 4.5:1 for normal text sizes and ≥ 3:1 for
 * large text sizes per WCAG 2.1 AA.
 *
 * **Validates: Requirements 1.1, 13.2, 13.3**
 */

// ============================================================
// oklch → sRGB conversion utilities
// ============================================================

/**
 * Parse an oklch color string into its components.
 * Supports formats: oklch(L C H) and oklch(L C H / alpha)
 */
function parseOklch(value: string): { L: number; C: number; H: number } | null {
  // Match oklch(L C H) or oklch(L C H / alpha)
  const match = value.match(
    /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+)?\s*\)/,
  );
  if (!match) return null;
  return {
    L: parseFloat(match[1]),
    C: parseFloat(match[2]),
    H: parseFloat(match[3]),
  };
}

/**
 * Convert oklch to oklab (polar → cartesian)
 */
function oklchToOklab(L: number, C: number, H: number): { L: number; a: number; b: number } {
  const hRad = (H * Math.PI) / 180;
  return {
    L,
    a: C * Math.cos(hRad),
    b: C * Math.sin(hRad),
  };
}

/**
 * Convert oklab to linear sRGB
 * Reference: https://bottosson.github.io/posts/oklab/
 */
function oklabToLinearSrgb(L: number, a: number, b: number): { r: number; g: number; b: number } {
  // oklab → LMS (approximate inverse)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // LMS → linear sRGB
  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bVal = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  return { r, g, b: bVal };
}

/**
 * Apply sRGB gamma (linear → sRGB)
 */
function linearToSrgb(c: number): number {
  if (c <= 0.0031308) {
    return 12.92 * c;
  }
  return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/**
 * Clamp a value between 0 and 1
 */
function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Convert oklch to sRGB [0-1] values (clamped to gamut)
 */
function oklchToSrgb(L: number, C: number, H: number): { r: number; g: number; b: number } {
  const lab = oklchToOklab(L, C, H);
  const linear = oklabToLinearSrgb(lab.L, lab.a, lab.b);
  return {
    r: clamp01(linearToSrgb(linear.r)),
    g: clamp01(linearToSrgb(linear.g)),
    b: clamp01(linearToSrgb(linear.b)),
  };
}

// ============================================================
// WCAG 2.1 contrast ratio calculation
// ============================================================

/**
 * Compute relative luminance per WCAG 2.1
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function relativeLuminance(r: number, g: number, b: number): number {
  // sRGB values are already in [0,1], apply inverse gamma
  const rLin = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLin = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLin = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Compute contrast ratio between two colors per WCAG 2.1
 * Returns a value >= 1 (e.g., 4.5 means 4.5:1)
 */
function contrastRatio(
  fg: { r: number; g: number; b: number },
  bg: { r: number; g: number; b: number },
): number {
  const lumFg = relativeLuminance(fg.r, fg.g, fg.b);
  const lumBg = relativeLuminance(bg.r, bg.g, bg.b);
  const lighter = Math.max(lumFg, lumBg);
  const darker = Math.min(lumFg, lumBg);
  return (lighter + 0.05) / (darker + 0.05);
}

// ============================================================
// CSS token parsing
// ============================================================

interface ColorPair {
  name: string;
  theme: "light" | "dark";
  foreground: { L: number; C: number; H: number };
  background: { L: number; C: number; H: number };
}

/**
 * Parse the index.css file and extract semantic color pairs for both themes.
 * A "pair" is a token like --primary (background) and --primary-foreground (foreground).
 */
function parseColorPairsFromCSS(cssContent: string): ColorPair[] {
  const pairs: ColorPair[] = [];

  // Define the semantic color pair names to check
  // Each name maps to --<name> (background) and --<name>-foreground (foreground)
  const pairNames = [
    "primary",
    "secondary",
    "accent",
    "destructive",
    "success",
    "warning",
    "info",
    "muted",
    "card",
    "popover",
    "sidebar-primary",
    "sidebar-accent",
  ];

  // Additional pairs with non-standard naming (foreground/background base pair)
  const basePairs: Array<{ fg: string; bg: string; name: string }> = [
    { fg: "foreground", bg: "background", name: "base" },
  ];

  // Extract :root block
  const rootMatch = cssContent.match(/:root\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s);
  // Extract .dark block
  const darkMatch = cssContent.match(/\.dark\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s);

  function extractTokens(block: string): Map<string, string> {
    const tokens = new Map<string, string>();
    const regex = /--([\w-]+)\s*:\s*([^;]+);/g;
    let match;
    while ((match = regex.exec(block)) !== null) {
      tokens.set(match[1], match[2].trim());
    }
    return tokens;
  }

  function processTheme(
    block: string,
    theme: "light" | "dark",
  ): void {
    const tokens = extractTokens(block);

    for (const name of pairNames) {
      const bgValue = tokens.get(name);
      const fgValue = tokens.get(`${name}-foreground`);

      if (!bgValue || !fgValue) continue;

      const bgParsed = parseOklch(bgValue);
      const fgParsed = parseOklch(fgValue);

      if (!bgParsed || !fgParsed) continue;

      pairs.push({
        name,
        theme,
        foreground: fgParsed,
        background: bgParsed,
      });
    }

    // Process base pairs with non-standard naming
    for (const { fg, bg, name } of basePairs) {
      const bgValue = tokens.get(bg);
      const fgValue = tokens.get(fg);

      if (!bgValue || !fgValue) continue;

      const bgParsed = parseOklch(bgValue);
      const fgParsed = parseOklch(fgValue);

      if (!bgParsed || !fgParsed) continue;

      pairs.push({
        name,
        theme,
        foreground: fgParsed,
        background: bgParsed,
      });
    }
  }

  if (rootMatch) {
    processTheme(rootMatch[1], "light");
  }

  if (darkMatch) {
    processTheme(darkMatch[1], "dark");
  }

  return pairs;
}

// ============================================================
// Load CSS and extract pairs
// ============================================================

const cssPath = path.resolve(__dirname, "../index.css");
const cssContent = fs.readFileSync(cssPath, "utf-8");
const colorPairs = parseColorPairsFromCSS(cssContent);

// ============================================================
// Property-based tests
// ============================================================

describe("Property 3: Token Contrast Compliance", () => {
  it("should have extracted color pairs from both themes", () => {
    expect(colorPairs.length).toBeGreaterThan(0);

    const lightPairs = colorPairs.filter((p) => p.theme === "light");
    const darkPairs = colorPairs.filter((p) => p.theme === "dark");

    expect(lightPairs.length).toBeGreaterThan(0);
    expect(darkPairs.length).toBeGreaterThan(0);
  });

  it("all semantic color pairs meet WCAG 2.1 AA normal text contrast (≥ 4.5:1)", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...colorPairs),
        (pair) => {
          const fgSrgb = oklchToSrgb(pair.foreground.L, pair.foreground.C, pair.foreground.H);
          const bgSrgb = oklchToSrgb(pair.background.L, pair.background.C, pair.background.H);
          const ratio = contrastRatio(fgSrgb, bgSrgb);

          // WCAG 2.1 AA requires ≥ 4.5:1 for normal text
          expect(ratio).toBeGreaterThanOrEqual(4.5);

          return ratio >= 4.5;
        },
      ),
      { numRuns: 200 },
    );
  });

  it("all semantic color pairs meet WCAG 2.1 AA large text contrast (≥ 3:1)", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...colorPairs),
        (pair) => {
          const fgSrgb = oklchToSrgb(pair.foreground.L, pair.foreground.C, pair.foreground.H);
          const bgSrgb = oklchToSrgb(pair.background.L, pair.background.C, pair.background.H);
          const ratio = contrastRatio(fgSrgb, bgSrgb);

          // WCAG 2.1 AA requires ≥ 3:1 for large text
          expect(ratio).toBeGreaterThanOrEqual(3.0);

          return ratio >= 3.0;
        },
      ),
      { numRuns: 200 },
    );
  });

  it("light theme color pairs all meet ≥ 4.5:1 contrast for normal text", () => {
    const lightPairs = colorPairs.filter((p) => p.theme === "light");

    fc.assert(
      fc.property(
        fc.constantFrom(...lightPairs),
        (pair) => {
          const fgSrgb = oklchToSrgb(pair.foreground.L, pair.foreground.C, pair.foreground.H);
          const bgSrgb = oklchToSrgb(pair.background.L, pair.background.C, pair.background.H);
          const ratio = contrastRatio(fgSrgb, bgSrgb);

          return ratio >= 4.5;
        },
      ),
      { numRuns: 100 },
    );
  });

  it("dark theme color pairs all meet ≥ 4.5:1 contrast for normal text", () => {
    const darkPairs = colorPairs.filter((p) => p.theme === "dark");

    fc.assert(
      fc.property(
        fc.constantFrom(...darkPairs),
        (pair) => {
          const fgSrgb = oklchToSrgb(pair.foreground.L, pair.foreground.C, pair.foreground.H);
          const bgSrgb = oklchToSrgb(pair.background.L, pair.background.C, pair.background.H);
          const ratio = contrastRatio(fgSrgb, bgSrgb);

          return ratio >= 4.5;
        },
      ),
      { numRuns: 100 },
    );
  });
});
