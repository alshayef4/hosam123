import { useEffect } from "react";
import { useLocation } from "wouter";

const SCROLL_KEY_PREFIX = "scroll_pos_";

/**
 * Hook that restores scroll position on browser back navigation.
 * Uses sessionStorage to save scroll positions per route and
 * listens to popstate events to detect back/forward navigation.
 *
 * Validates: Requirements 10.5
 */
export function useScrollRestore() {
  const [location] = useLocation();

  useEffect(() => {
    // Save scroll position before navigating away
    function saveScrollPosition() {
      const key = SCROLL_KEY_PREFIX + location;
      sessionStorage.setItem(key, String(window.scrollY));
    }

    // Restore scroll position on popstate (back/forward navigation)
    function handlePopState() {
      const key = SCROLL_KEY_PREFIX + location;
      const savedPosition = sessionStorage.getItem(key);
      if (savedPosition !== null) {
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedPosition, 10));
        });
      }
    }

    // Save position on scroll (debounced)
    let scrollTimeout: ReturnType<typeof setTimeout>;
    function handleScroll() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(saveScrollPosition, 150);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [location]);
}
