import * as XLSX from 'xlsx';

/**
 * Export data to Excel format
 */
export function exportToExcel(
  data: any[],
  fileName: string,
  sheetName: string = 'Data'
) {
  if (!data || data.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  try {
    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Style the header row
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1F2937' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    }

    // Auto-fit columns
    const colWidths = data.length > 0
      ? Object.keys(data[0]).map(key => ({
          wch: Math.max(
            key.length + 2,
            Math.max(...data.map(row => String(row[key] || '').length))
          ),
        }))
      : [];
    ws['!cols'] = colWidths;

    // Write file
    XLSX.writeFile(wb, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('خطأ في تصدير Excel:', error);
    alert('حدث خطأ أثناء تصدير البيانات');
  }
}

/**
 * Export data to CSV format with proper encoding for Arabic
 */
export function exportToCSV(
  data: any[],
  fileName: string
) {
  if (!data || data.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  try {
    // Convert to CSV
    const csv = convertToCSV(data);

    // Create blob with UTF-8 BOM for proper Arabic encoding in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('خطأ في تصدير CSV:', error);
    alert('حدث خطأ أثناء تصدير البيانات');
  }
}

/**
 * Convert array of objects to CSV string
 */
function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.map(header => `"${header}"`).join(',');

  const csvRows = data.map(row =>
    headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '""';
      const stringValue = String(value);
      // Escape quotes and wrap in quotes
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Format data for export (convert dates, format numbers, etc.)
 */
export function formatDataForExport(data: any[], dateFields: string[] = []): any[] {
  return data.map(row => {
    const formatted: any = {};
    for (const [key, value] of Object.entries(row)) {
      if (dateFields.includes(key) && value instanceof Date) {
        formatted[key] = value.toLocaleDateString('ar-SA');
      } else if (typeof value === 'boolean') {
        formatted[key] = value ? 'نعم' : 'لا';
      } else {
        formatted[key] = value;
      }
    }
    return formatted;
  });
}

/**
 * Create a formatted report with headers and metadata
 */
export function createReportData(
  title: string,
  data: any[],
  metadata?: { [key: string]: string }
): any[] {
  const report: any[] = [];

  // Add title
  if (title) {
    report.push({ 'التقرير': title });
    report.push({});
  }

  // Add metadata
  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      report.push({ [key]: value });
    }
    report.push({});
  }

  // Add data
  report.push(...data);

  return report;
}
