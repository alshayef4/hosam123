import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import { onlineManager } from "@tanstack/react-query";

/**
 * OfflineIndicator displays a fixed banner at the top of the viewport
 * when the network is unavailable. It integrates with TanStack Query's
 * onlineManager and auto-retries failed requests (3 times, 5s interval).
 *
 * Validates: Requirements 16.2
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      onlineManager.setOnline(true);
      setShowReconnected(true);
      // Hide the reconnected message after 3 seconds
      setTimeout(() => setShowReconnected(false), 3000);
    }

    function handleOffline() {
      setIsOnline(false);
      onlineManager.setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // TanStack Query pauses queries when offline via onlineManager.
  // When back online, queries resume automatically with retry config
  // (3 retries, 5s interval) set in the QueryClient defaults.

  const showBanner = !isOnline || showReconnected;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" as const }}
          className={`fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium ${
            isOnline
              ? "bg-green-600 text-white"
              : "bg-destructive text-destructive-foreground"
          }`}
          role="alert"
          aria-live="assertive"
        >
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" strokeWidth={1.5} />
              <span>تم استعادة الاتصال</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" strokeWidth={1.5} />
              <span>لا يوجد اتصال بالإنترنت</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default OfflineIndicator;
