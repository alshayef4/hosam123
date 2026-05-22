import { Button } from "@/components/ui/button";
import { exportToExcel, exportToCSV } from "@/lib/exportUtils";
import { Download, FileSpreadsheet } from "lucide-react";
import { showEnhancedToast } from "@/components/EnhancedToast";

interface ExportButtonsProps {
  data: Record<string, unknown>[];
  filename: string;
  formats?: ("excel" | "csv")[];
}

/**
 * Export button group (Excel, CSV) accepting data array and filename.
 * Uses existing export utilities from the project.
 * RTL-compatible via logical properties.
 *
 * Validates: Requirements 6.2, 18.6
 */
export function ExportButtons({
  data,
  filename,
  formats = ["excel", "csv"],
}: ExportButtonsProps) {
  const handleExport = (format: "excel" | "csv") => {
    if (!data || data.length === 0) {
      showEnhancedToast("error", { title: "خطأ", description: "لا توجد بيانات للتصدير" });
      return;
    }

    if (format === "excel") {
      exportToExcel(data, filename, filename);
    } else {
      exportToCSV(data, filename);
    }

    showEnhancedToast("success", { title: "📥 تم التصدير", description: "تم تصدير البيانات بنجاح" });
  };

  return (
    <div className="flex items-center gap-2">
      {formats.includes("excel") && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport("excel")}
        >
          <FileSpreadsheet className="h-5 w-5" strokeWidth={1.5} />
          Excel
        </Button>
      )}
      {formats.includes("csv") && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport("csv")}
        >
          <Download className="h-5 w-5" strokeWidth={1.5} />
          CSV
        </Button>
      )}
    </div>
  );
}
