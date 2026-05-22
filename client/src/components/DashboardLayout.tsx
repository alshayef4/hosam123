import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/useMobile";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Users,
  FileText,
  BarChart3,
  Zap,
  Moon,
  Sun,
  Info,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";
import { springToggle } from "@/lib/motion";
import { Footer } from "./Footer";

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/", color: "text-blue-500 dark:text-blue-400" },
  { icon: Users, label: "العملاء", path: "/customers", color: "text-violet-500 dark:text-violet-400" },
  { icon: FileText, label: "الدفاتر الشهرية", path: "/ledgers", color: "text-cyan-500 dark:text-cyan-400" },
  { icon: BarChart3, label: "التقارير", path: "/reports", color: "text-emerald-500 dark:text-emerald-400" },
  { icon: Info, label: "حول التطبيق", path: "/about", color: "text-amber-500 dark:text-amber-400" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

/**
 * Responsive breakpoint hook for layout decisions.
 * - mobile: < 640px
 * - tablet: 640px–1024px
 * - laptop: 1024px–1440px
 * - desktop: > 1440px
 */
function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<"mobile" | "tablet" | "laptop" | "desktop">(() => {
    if (typeof window === "undefined") return "laptop";
    const w = window.innerWidth;
    if (w < 640) return "mobile";
    if (w < 1024) return "tablet";
    if (w < 1440) return "laptop";
    return "desktop";
  });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setBreakpoint("mobile");
      else if (w < 1024) setBreakpoint("tablet");
      else if (w < 1440) setBreakpoint("laptop");
      else setBreakpoint("desktop");
    };

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return breakpoint;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
      return saved ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, parseInt(saved, 10))) : DEFAULT_WIDTH;
    } catch {
      return DEFAULT_WIDTH;
    }
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
    } catch {
      // localStorage unavailable (private browsing)
    }
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();

  // Auto-collapse sidebar to icon-only on tablet breakpoint (only on actual breakpoint change)
  const prevBreakpointRef = useRef(breakpoint);
  useEffect(() => {
    if (prevBreakpointRef.current === breakpoint) return;
    prevBreakpointRef.current = breakpoint;
    
    if (breakpoint === "tablet") {
      setOpen(false); // collapsed = icon-only
    } else if (breakpoint === "laptop" || breakpoint === "desktop") {
      setOpen(true); // expanded
    }
  }, [breakpoint, setOpen]);

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      // Sidebar is on the right side (RTL), so width = right edge - mouse position
      const sidebarRight = sidebarRef.current?.getBoundingClientRect().right ?? 0;
      const newWidth = sidebarRight - e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  // Truncate name to 20 characters
  const truncatedName = user?.name
    ? user.name.length > 20
      ? user.name.slice(0, 20) + "…"
      : user.name
    : "-";

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          side="right"
          collapsible="icon"
          className="bg-sidebar/80 backdrop-blur-xl border-e border-border/30 transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          disableTransition={isResizing}
        >
          {/* Header */}
          <SidebarHeader className="h-16 border-b border-border/30 justify-center">
            <div className="flex flex-row-reverse items-center gap-3 px-2 transition-all duration-300 ease-out w-full">
              <button
                onClick={toggleSidebar}
                className="min-h-11 min-w-[44px] h-11 w-11 flex items-center justify-center hover:bg-primary/10 dark:hover:bg-primary/20 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <motion.span
                  animate={{ rotate: isCollapsed ? 180 : 0 }}
                  transition={springToggle}
                  className="flex items-center justify-center"
                >
                  <PanelLeft
                    className="h-5 w-5 text-primary"
                    strokeWidth={1.5}
                  />
                </motion.span>
              </button>
              {!isCollapsed ? (
                <div className="flex flex-row-reverse items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-glow-sm">
                    <Zap className="w-4 h-4 text-white" strokeWidth={1.5} />
                  </div>
                  <span className="font-bold tracking-tight truncate text-foreground text-sm">
                    دفتر السداد
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          {/* Menu Items */}
          <SidebarContent className="gap-0 py-4">
            <SidebarMenu className="px-2 gap-1.5">
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => {
                        setLocation(item.path);
                        // Collapse/close sidebar after navigation on all screen sizes
                        if (isMobile) {
                          // On mobile: close the Sheet overlay
                          toggleSidebar();
                        } else {
                          // On desktop/tablet: collapse to icon-only
                          setOpen(false);
                        }
                      }}
                      tooltip={item.label}
                      className={`min-h-11 h-11 transition-all duration-300 ease-out font-medium rounded-xl ${
                        isActive
                          ? "bg-gradient-to-r from-primary to-accent text-white shadow-glow-md rounded-xl border-e-[3px] border-e-white/40"
                          : "hover:bg-muted/80 dark:hover:bg-muted/40 hover:scale-[1.02] hover:text-foreground transition-all duration-200"
                      }`}
                    >
                      <item.icon
                        className={`h-5 w-5 transition-colors duration-200 ${
                          isActive ? "text-white" : item.color
                        }`}
                        strokeWidth={1.5}
                      />
                      <span className={`transition-colors duration-200 ${isActive ? "text-white" : ""}`}>
                        {item.label}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          {/* Theme Toggle in Sidebar */}
          <div className="px-3 py-2 border-t border-border/30">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <span className="text-xs text-muted-foreground">المظهر</span>
              )}
              <ThemeToggle size={isCollapsed ? "sm" : "md"} />
            </div>
          </div>

          {/* Developer Credit */}
          {!isCollapsed && (
            <div className="px-3 py-2 border-t border-border/30">
              <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
                تطوير{" "}
                <a href="https://www.linkedin.com/in/alshayef" target="_blank" rel="noopener noreferrer" className="text-primary/70 hover:text-primary transition-colors">
                  م. فواز الشايف
                </a>
              </p>
            </div>
          )}

          {/* Footer - User Profile */}
          <SidebarFooter className="border-t border-border/30 p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-200 w-full text-start group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-10 w-10 border-2 border-primary/30 shrink-0 shadow-glow-sm">
                    <AvatarFallback className="text-xs font-bold bg-gradient-to-r from-primary to-accent text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-semibold truncate leading-none text-foreground max-w-[20ch]">
                      {truncatedName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <ThemeSwitcher />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive font-medium"
                >
                  <LogOut className="h-5 w-5" strokeWidth={1.5} />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Resize Handle - hidden on mobile/tablet */}
        {!isMobile && breakpoint !== "mobile" && (
          <div
            className={`absolute top-0 end-0 w-1 h-full cursor-col-resize transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isCollapsed ? "hidden" : ""
            }`}
            style={{
              zIndex: 50,
              background: isResizing
                ? "linear-gradient(180deg, oklch(0.55 0.22 264 / 0.6), oklch(0.58 0.22 280 / 0.6))"
                : "transparent",
            }}
            onMouseDown={() => {
              if (isCollapsed) return;
              setIsResizing(true);
            }}
            onMouseEnter={(e) => {
              if (!isCollapsed) {
                (e.currentTarget as HTMLElement).style.background =
                  "linear-gradient(180deg, oklch(0.55 0.22 264 / 0.4), oklch(0.58 0.22 280 / 0.4))";
              }
            }}
            onMouseLeave={(e) => {
              if (!isResizing) {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }
            }}
            onKeyDown={(e) => {
              if (isCollapsed) return;
              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                // RTL: sidebar is on right, ArrowLeft = wider, ArrowRight = narrower
                const delta = e.key === "ArrowLeft" ? 10 : -10;
                const currentWidth = sidebarRef.current?.getBoundingClientRect().width ?? DEFAULT_WIDTH;
                const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, currentWidth + delta));
                setSidebarWidth(newWidth);
              }
            }}
            role="separator"
            aria-orientation="vertical"
            aria-label="تغيير عرض القائمة الجانبية"
            tabIndex={isCollapsed ? -1 : 0}
          />
        )}
      </div>

      <SidebarInset>
        {/* Mobile Header (<768px): sticky, 64px height, glass background, hamburger trigger, page title, theme toggle */}
        {isMobile && (
          <header
            className="sticky top-0 z-40 flex items-center justify-between border-b border-border/30 bg-sidebar/80 backdrop-blur-xl transition-all duration-300 ease-out"
            style={{ height: "64px", paddingInline: "16px" }}
          >
            <div className="flex items-center gap-3">
              <SidebarTrigger
                className="min-h-[44px] min-w-[44px] h-11 w-11 rounded-xl bg-muted/60 hover:bg-muted transition-colors duration-300"
                aria-label="فتح القائمة"
              />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-glow-sm">
                  <Zap className="w-4 h-4 text-white" strokeWidth={1.5} />
                </div>
                <span className="font-semibold text-foreground text-sm">
                  {activeMenuItem?.label ?? "القائمة"}
                </span>
              </div>
            </div>
            <ThemeToggle size="sm" className="min-h-[44px] min-w-[44px]" />
          </header>
        )}

        {/* Main Content Area with responsive padding and grid layout */}
        <main
          className="flex-1 bg-gradient-mesh bg-background min-h-screen transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            paddingInline: breakpoint === "mobile" ? "16px" : breakpoint === "tablet" ? "24px" : breakpoint === "laptop" ? "32px" : "40px",
            paddingBlock: breakpoint === "mobile" ? "16px" : breakpoint === "tablet" ? "24px" : breakpoint === "laptop" ? "32px" : "40px",
          }}
        >
          <div
            className="animate-fade-in transition-[max-width] duration-300 ease-out"
            style={{
              maxWidth: breakpoint === "desktop" ? "1400px" : "none",
              marginInline: breakpoint === "desktop" ? "auto" : undefined,
            }}
          >
            {children}
          </div>
        </main>
        <Footer />
      </SidebarInset>
    </>
  );
}

function ThemeSwitcher() {
  const { theme, toggleTheme, switchable } = useTheme();

  if (!switchable || !toggleTheme) return null;

  return (
    <DropdownMenuItem
      onClick={toggleTheme}
      className="cursor-pointer font-medium"
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
          <span>الوضع الفاتح</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5 text-indigo-500" strokeWidth={1.5} />
          <span>الوضع الداكن</span>
        </>
      )}
    </DropdownMenuItem>
  );
}
