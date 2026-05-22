import { useCallback, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

/**
 * Default dev user. Authentication is disabled — the app is always accessible.
 */
const DEV_USER = {
  id: 1,
  openId: "dev-local-user",
  name: "فواز الشايف",
  email: "fawaz@payment-ledger.dev",
  loginMethod: "dev",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export function useAuth(_options?: UseAuthOptions) {
  const state = useMemo(() => ({
    user: DEV_USER,
    loading: false,
    error: null,
    isAuthenticated: true,
  }), []);

  const logout = useCallback(async () => {
    // No-op: authentication is disabled
  }, []);

  return {
    ...state,
    refresh: () => Promise.resolve(),
    logout,
  };
}
