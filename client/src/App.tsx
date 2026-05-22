import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import { LoadingState } from "./components/LoadingState";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { pageTransition, pageTransitionConfig } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Lazy-loaded page components for code splitting
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Customers = React.lazy(() => import("./pages/Customers"));
const Ledgers = React.lazy(() => import("./pages/Ledgers"));
const LedgerDetail = React.lazy(() => import("./pages/LedgerDetail"));
const Reports = React.lazy(() => import("./pages/Reports"));
const About = React.lazy(() => import("./pages/About"));

/**
 * Reduced-motion page transition variants.
 * Only opacity fades (no transforms) to comply with prefers-reduced-motion.
 * Validates: Requirements 12.4, 12.6
 */
const reducedMotionTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const reducedMotionConfig = { duration: 0.001 };

function Router() {
  const [location] = useLocation();
  const prefersReducedMotion = useReducedMotion();

  // Select variants based on motion preference:
  // - Full motion: fade + 10px y-translate, 400ms ease-out
  // - Reduced motion: instant opacity (no transforms)
  const variants = prefersReducedMotion ? reducedMotionTransition : pageTransition;
  const transition = prefersReducedMotion ? reducedMotionConfig : pageTransitionConfig;

  return (
    <DashboardLayout>
      <Suspense fallback={<LoadingState message="جاري تحميل الصفحة..." />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
          >
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/customers" component={Customers} />
              <Route path="/ledgers" component={Ledgers} />
              <Route path="/ledger/:ledgerId" component={LedgerDetail} />
              <Route path="/reports" component={Reports} />
              <Route path="/about" component={About} />
              <Route path="/404" component={NotFound} />
              {/* Final fallback route */}
              <Route component={NotFound} />
            </Switch>
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster />
          <OfflineIndicator />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
