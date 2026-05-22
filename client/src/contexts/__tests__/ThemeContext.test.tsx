import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import fc from "fast-check";
import React from "react";
import { ThemeProvider, useTheme } from "../ThemeContext";

// Helper to create a wrapper with ThemeProvider
function createWrapper(props?: { defaultTheme?: "light" | "dark"; switchable?: boolean }) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider
        defaultTheme={props?.defaultTheme ?? "light"}
        switchable={props?.switchable ?? true}
      >
        {children}
      </ThemeProvider>
    );
  };
}

describe("ThemeContext", () => {
  let localStorageStore: Record<string, string>;

  beforeEach(() => {
    localStorageStore = {};

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageStore[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageStore[key];
      }),
      clear: vi.fn(() => {
        localStorageStore = {};
      }),
      get length() {
        return Object.keys(localStorageStore).length;
      },
      key: vi.fn((index: number) => Object.keys(localStorageStore)[index] ?? null),
    };

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    // Clean up document classes
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.classList.remove("dark");
  });

  describe("Theme persistence to localStorage on toggle", () => {
    it("persists 'dark' to localStorage when toggling from light to dark", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: true }),
      });

      act(() => {
        result.current.toggleTheme!();
      });

      expect(localStorage.setItem).toHaveBeenCalledWith("theme", "dark");
      expect(localStorageStore["theme"]).toBe("dark");
    });

    it("persists 'light' to localStorage when toggling from dark to light", () => {
      localStorageStore["theme"] = "dark";

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: true }),
      });

      act(() => {
        result.current.toggleTheme!();
      });

      expect(localStorage.setItem).toHaveBeenCalledWith("theme", "light");
      expect(localStorageStore["theme"]).toBe("light");
    });

    it("does not persist theme when switchable is false", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: false }),
      });

      // toggleTheme should be undefined when not switchable
      expect(result.current.toggleTheme).toBeUndefined();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("Theme restoration from localStorage on mount", () => {
    it("restores dark theme from localStorage on mount", () => {
      localStorageStore["theme"] = "dark";

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: true }),
      });

      expect(result.current.theme).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("restores light theme from localStorage on mount", () => {
      localStorageStore["theme"] = "light";

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: true }),
      });

      expect(result.current.theme).toBe("light");
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("applies .dark class to document.documentElement when dark theme is restored", () => {
      localStorageStore["theme"] = "dark";

      renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: true }),
      });

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  describe("Default to light when no stored preference", () => {
    it("defaults to light theme when localStorage has no theme key", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: true }),
      });

      expect(result.current.theme).toBe("light");
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("defaults to light theme when localStorage has an invalid value", () => {
      localStorageStore["theme"] = "invalid-value";

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: true }),
      });

      expect(result.current.theme).toBe("light");
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("uses defaultTheme prop when no stored preference exists", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ defaultTheme: "dark", switchable: true }),
      });

      expect(result.current.theme).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  describe("Handles localStorage errors gracefully", () => {
    it("defaults to light theme when localStorage.getItem throws", () => {
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: vi.fn(() => {
            throw new Error("SecurityError: access denied");
          }),
          setItem: vi.fn(() => {
            throw new Error("SecurityError: access denied");
          }),
          removeItem: vi.fn(),
          clear: vi.fn(),
          length: 0,
          key: vi.fn(),
        },
        writable: true,
      });

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: true }),
      });

      expect(result.current.theme).toBe("light");
    });

    it("does not crash when localStorage.setItem throws on toggle", () => {
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: vi.fn(() => null),
          setItem: vi.fn(() => {
            throw new Error("QuotaExceededError");
          }),
          removeItem: vi.fn(),
          clear: vi.fn(),
          length: 0,
          key: vi.fn(),
        },
        writable: true,
      });

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: true }),
      });

      // Should not throw when toggling
      expect(() => {
        act(() => {
          result.current.toggleTheme!();
        });
      }).not.toThrow();

      // Theme should still update in memory
      expect(result.current.theme).toBe("dark");
    });

    it("applies .dark class correctly even when localStorage is unavailable", () => {
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: vi.fn(() => {
            throw new Error("SecurityError");
          }),
          setItem: vi.fn(() => {
            throw new Error("SecurityError");
          }),
          removeItem: vi.fn(),
          clear: vi.fn(),
          length: 0,
          key: vi.fn(),
        },
        writable: true,
      });

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ defaultTheme: "dark", switchable: true }),
      });

      expect(result.current.theme).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  describe("useTheme hook", () => {
    it("throws when used outside ThemeProvider", () => {
      // Suppress console.error for expected error
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow("useTheme must be used within ThemeProvider");

      consoleSpy.mockRestore();
    });
  });
});

/**
 * Property 1: Theme Persistence Roundtrip
 *
 * For any theme value T in {light, dark}, storing T to localStorage and reading
 * it back SHALL return T, and ThemeContext SHALL apply the corresponding class
 * within 100ms of initialization.
 *
 * **Validates: Requirements 13.7, 13.8**
 */
describe("Property 1: Theme Persistence Roundtrip", () => {
  let localStorageStore: Record<string, string>;

  beforeEach(() => {
    localStorageStore = {};

    const localStorageMock = {
      getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageStore[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageStore[key];
      }),
      clear: vi.fn(() => {
        localStorageStore = {};
      }),
      get length() {
        return Object.keys(localStorageStore).length;
      },
      key: vi.fn((index: number) => Object.keys(localStorageStore)[index] ?? null),
    };

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.classList.remove("dark");
  });

  it("any theme T stored to localStorage is correctly restored on mount and applies the corresponding class", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const),
        (theme) => {
          // Clean up from previous iteration
          document.documentElement.classList.remove("dark");
          localStorageStore = {};

          // Store theme to localStorage (simulating a previous session)
          localStorageStore["theme"] = theme;

          // Mount ThemeProvider — it should read from localStorage
          const wrapper = createWrapper({ switchable: true });
          const { result, unmount } = renderHook(() => useTheme(), { wrapper });

          // The theme state should match what was stored
          expect(result.current.theme).toBe(theme);

          // The .dark class should be applied if and only if theme is "dark"
          const hasDarkClass = document.documentElement.classList.contains("dark");
          if (theme === "dark") {
            expect(hasDarkClass).toBe(true);
          } else {
            expect(hasDarkClass).toBe(false);
          }

          // Clean up
          unmount();
          document.documentElement.classList.remove("dark");
        },
      ),
      { numRuns: 50 },
    );
  });

  it("toggling to theme T persists T to localStorage and the value can be read back", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const),
        (targetTheme) => {
          // Clean up from previous iteration
          document.documentElement.classList.remove("dark");
          localStorageStore = {};

          // Start with the opposite theme
          const startTheme = targetTheme === "light" ? "dark" : "light";
          localStorageStore["theme"] = startTheme;

          const wrapper = createWrapper({ switchable: true });
          const { result, unmount } = renderHook(() => useTheme(), { wrapper });

          // Toggle to reach the target theme
          act(() => {
            result.current.toggleTheme!();
          });

          // Verify the theme was persisted
          expect(localStorageStore["theme"]).toBe(targetTheme);

          // Verify reading it back returns the same value
          expect(localStorage.getItem("theme")).toBe(targetTheme);

          // Verify the class is applied correctly
          const hasDarkClass = document.documentElement.classList.contains("dark");
          if (targetTheme === "dark") {
            expect(hasDarkClass).toBe(true);
          } else {
            expect(hasDarkClass).toBe(false);
          }

          // Clean up
          unmount();
          document.documentElement.classList.remove("dark");
        },
      ),
      { numRuns: 50 },
    );
  });

  it("after a sequence of toggles, the final persisted theme matches the final state", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom("toggle" as const), {
          minLength: 1,
          maxLength: 10,
        }),
        (toggleSequence) => {
          // Clean up from previous iteration
          document.documentElement.classList.remove("dark");
          localStorageStore = {};

          // Start with light theme (no stored preference)
          const wrapper = createWrapper({ switchable: true });
          const { result, unmount } = renderHook(() => useTheme(), { wrapper });

          // Determine expected final theme based on toggle count
          // Starting from "light", each toggle flips the theme
          let expectedTheme: "light" | "dark" = "light";
          for (const _ of toggleSequence) {
            expectedTheme = expectedTheme === "light" ? "dark" : "light";
            act(() => {
              result.current.toggleTheme!();
            });
          }

          // The persisted value should match the final state
          expect(localStorageStore["theme"]).toBe(expectedTheme);
          expect(result.current.theme).toBe(expectedTheme);

          // Clean up
          unmount();
          document.documentElement.classList.remove("dark");
        },
      ),
      { numRuns: 30 },
    );
  });
});
