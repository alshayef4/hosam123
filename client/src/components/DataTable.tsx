import * as React from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Inbox } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { useStaggerAnimation } from "@/hooks/useStaggerAnimation";

// --- Types ---

export interface ColumnDef<T> {
  /** Column key matching a property of T */
  key: keyof T;
  /** Display header label */
  label: string;
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Column data type for alignment: numeric → inline-end, text → inline-start */
  type?: "text" | "numeric";
  /** Custom cell renderer; defaults to `String(row[key])` */
  render?: (item: T) => React.ReactNode;
}

export interface DataTableEmptyState {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  /** Rows per page, default 20 */
  pageSize?: number;
  /** Client-side search/filter function */
  searchFilter?: (item: T, query: string) => boolean;
  /** Empty state configuration when no data */
  emptyState?: DataTableEmptyState;
  /** Placeholder text for search input */
  searchPlaceholder?: string;
}

type SortDirection = "asc" | "desc";

interface SortState<T> {
  column: keyof T | null;
  direction: SortDirection;
}

// --- Helpers ---

/** Returns alignment class based on column type using CSS logical properties */
function getAlignmentClass(type?: "text" | "numeric"): string {
  return type === "numeric" ? "text-end" : "text-start";
}

// --- Component ---

export function DataTable<T extends object>({
  data,
  columns,
  pageSize = 20,
  searchFilter,
  emptyState,
  searchPlaceholder = "بحث...",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sort, setSort] = React.useState<SortState<T>>({
    column: null,
    direction: "asc",
  });
  const [searchFocused, setSearchFocused] = React.useState(false);

  // Filter data
  const filteredData = React.useMemo(() => {
    if (!searchQuery || !searchFilter) return data;
    return data.filter((item) => searchFilter(item, searchQuery));
  }, [data, searchQuery, searchFilter]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sort.column) return filteredData;
    const key = sort.column;
    return [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[key as string];
      const bVal = (b as Record<string, unknown>)[key as string];

      // Handle nulls
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sort.direction === "asc" ? -1 : 1;
      if (bVal == null) return sort.direction === "asc" ? 1 : -1;

      // Compare
      let comparison = 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        comparison = aVal.localeCompare(bVal, "ar");
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else if (typeof aVal === "boolean" && typeof bVal === "boolean") {
        comparison = Number(aVal) - Number(bVal);
      } else {
        comparison = String(aVal).localeCompare(String(bVal), "ar");
      }

      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sort]);

  // Pagination
  const totalItems = data.length;
  const filteredCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Clamp current page
  const safePage = Math.min(currentPage, totalPages);
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (safePage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);
  const displayedCount = paginatedData.length;

  // Staggered entrance animation for table rows (50ms delay per item, max 20)
  const { containerVariants, itemVariants } = useStaggerAnimation(
    paginatedData.length,
    20
  );

  // Sort handler
  const handleSort = (columnKey: keyof T) => {
    setSort((prev) => {
      if (prev.column === columnKey) {
        return {
          column: columnKey,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { column: columnKey, direction: "asc" };
    });
  };

  // Render sort icon
  const renderSortIcon = (columnKey: keyof T) => {
    if (sort.column === columnKey) {
      return sort.direction === "asc" ? (
        <ArrowUp className="size-4 text-primary transition-transform duration-200" strokeWidth={1.5} />
      ) : (
        <ArrowDown className="size-4 text-primary transition-transform duration-200" strokeWidth={1.5} />
      );
    }
    return (
      <ArrowUpDown className="size-4 opacity-40 group-hover:opacity-70 transition-opacity duration-200" strokeWidth={1.5} />
    );
  };

  // Empty state: no data at all — use the EmptyState component
  if (data.length === 0 && emptyState) {
    const IconComponent = emptyState.icon ?? Inbox;
    return (
      <EmptyState
        message={emptyState.message}
        actionLabel={emptyState.actionLabel}
        onAction={emptyState.onAction}
        icon={IconComponent}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search + Count Summary */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Count summary */}
        <div className="text-sm text-muted-foreground text-start">
          إجمالي: {totalItems} | مفلتر: {filteredCount} | معروض:{" "}
          {displayedCount}
        </div>

        {/* Search input */}
        {searchFilter && (
          <div
            className={`relative w-full sm:max-w-xs transition-all duration-300 ${searchFocused ? "sm:max-w-sm" : ""}`}
          >
            <Search
              className={`absolute top-1/2 end-3 size-4 -translate-y-1/2 pointer-events-none transition-all duration-200 ${searchFocused ? "text-primary scale-110" : "text-muted-foreground"}`}
              strokeWidth={1.5}
            />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`pe-9 rounded-xl transition-all duration-200 ${searchFocused ? "ring-2 ring-primary/20 border-primary/40" : ""}`}
            />
          </div>
        )}
      </div>

      {/* Desktop/Tablet Table — hidden on mobile */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-border/40">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/10 hover:bg-muted/10">
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={`font-semibold py-3.5 px-4 border-b border-border ${getAlignmentClass(col.type)}`}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className={`group inline-flex items-center gap-2 hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1 py-0.5 ${col.type === "numeric" ? "flex-row-reverse" : ""}`}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      {renderSortIcon(col.key)}
                    </button>
                  ) : (
                    col.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <motion.tbody
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  لا توجد نتائج مطابقة
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  variants={itemVariants}
                  custom={rowIndex}
                  className={`
                    transition-all duration-150 border-border/30 border-b last:border-b-0
                    hover:bg-primary/8 hover:border-s-[3px] hover:border-s-primary/40
                    ${rowIndex % 2 === 0 ? "bg-muted/3" : "bg-transparent"}
                  `}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={String(col.key)}
                      className={`py-3.5 px-4 ${getAlignmentClass(col.type)}`}
                    >
                      {col.render
                        ? col.render(row)
                        : String(
                            (row as Record<string, unknown>)[
                              col.key as string
                            ] ?? "—"
                          )}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            )}
          </motion.tbody>
        </Table>
      </div>

      {/* Mobile Card Layout — visible only on mobile (<640px) */}
      <motion.div
        className="flex flex-col gap-2 sm:hidden"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {paginatedData.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            لا توجد نتائج مطابقة
          </div>
        ) : (
          paginatedData.map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              variants={itemVariants}
              custom={rowIndex}
              className={`
                rounded-lg border border-border/40 p-3
                transition-colors duration-150
                hover:bg-primary/5
                ${rowIndex % 2 === 0 ? "bg-muted/3" : "bg-transparent"}
              `}
            >
              {columns.map((col) => (
                <div
                  key={String(col.key)}
                  className="flex items-baseline justify-between gap-2 py-1.5"
                >
                  <span className="text-xs text-muted-foreground font-medium shrink-0">
                    {col.label}
                  </span>
                  <span
                    className={`text-sm ${col.type === "numeric" ? "text-end font-variant-numeric tabular-nums" : "text-start"}`}
                  >
                    {col.render
                      ? col.render(row)
                      : String(
                          (row as Record<string, unknown>)[
                            col.key as string
                          ] ?? "—"
                        )}
                  </span>
                </div>
              ))}
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      {filteredCount > pageSize && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/40 transition-all duration-200"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
          >
            السابق
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-h-11 min-w-11 sm:min-h-8 sm:min-w-8 sm:h-8 sm:w-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                    safePage === page
                      ? "bg-gradient-primary text-white shadow-glow-sm"
                      : "text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            {totalPages > 5 && (
              <span className="text-sm text-muted-foreground px-1">...</span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/40 transition-all duration-200"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Status badge component for use within DataTable cells.
 * Renders a pill-shaped badge with 15% opacity background and full-opacity foreground.
 * Meets 4.5:1 contrast ratio requirement.
 *
 * Validates: Requirements 8.5
 */
export interface StatusBadgeProps {
  /** The label text to display */
  label: string;
  /** Semantic variant determining the color scheme */
  variant: "success" | "warning" | "destructive" | "info" | "neutral";
}

const statusBadgeStyles: Record<StatusBadgeProps["variant"], string> = {
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  destructive: "bg-red-500/15 text-red-700 dark:text-red-400",
  info: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  neutral: "bg-gray-500/15 text-gray-700 dark:text-gray-400",
};

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeStyles[variant]}`}
    >
      {label}
    </span>
  );
}
