import { useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Download, Printer } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatDate } from "@/lib/formatDate";
import { LoadingState } from "@/components/LoadingState";
import { ExportButtons } from "@/components/ExportButtons";
import { showEnhancedToast } from "@/components/EnhancedToast";

const PIE_COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b"];

export default function Reports() {
  const ledgersQuery = trpc.ledgers.list.useQuery();
  const customersQuery = trpc.customers.list.useQuery();
  const reportRef = useRef<HTMLDivElement>(null);

  // Get current (first active) ledger for stats
  const currentLedger = ledgersQuery.data?.[0];
  const currentLedgerStatsQuery = trpc.payments.getStats.useQuery(
    { ledgerId: currentLedger?.id as string },
    { enabled: !!currentLedger?.id }
  );

  const calculateAllStats = () => {
    const stats = {
      totalCustomers: customersQuery.data?.length || 0,
      totalLedgers: ledgersQuery.data?.length || 0,
      totalPayments: currentLedgerStatsQuery.data?.total || 0,
      paidPayments: currentLedgerStatsQuery.data?.paid || 0,
      unpaidPayments: currentLedgerStatsQuery.data?.unpaid || 0,
    };

    return stats;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // Use browser's native print dialog which handles PDF export natively
    // This is more reliable than html2pdf.js which freezes on complex SVG charts
    window.print();
  };

  const stats = calculateAllStats();

  // Data for ExportButtons component
  const exportData: Record<string, unknown>[] =
    ledgersQuery.data?.map((ledger) => ({
      "عنوان الدفتر": ledger.title,
      "الشهر والسنة": formatDate(ledger.monthYear),
      الحالة: ledger.isActive ? "نشط" : "مؤرشف",
    })) || [];

  // Bar chart data
  const chartData =
    ledgersQuery.data?.map((ledger) => ({
      name: ledger.title,
      date: new Date(ledger.monthYear).toLocaleDateString("ar-SA", {
        month: "short",
        year: "numeric",
      }),
    })) || [];

  // Pie chart data for payment statistics
  const pieData = [
    { name: "المسددة", value: stats.paidPayments },
    { name: "غير المسددة", value: stats.unpaidPayments },
  ];

  return (
    <div
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gradient">
          التقارير والإحصائيات
        </h1>
        <p className="text-muted-foreground text-lg">
          عرض شامل لجميع الإحصائيات والبيانات
        </p>
      </div>

      {/* Export Actions */}
      <div className="flex flex-row-reverse gap-2 items-center">
        <Button onClick={handlePrint}>
          <Printer className="h-5 w-5" strokeWidth={1.5} />
          طباعة
        </Button>
        <ExportButtons data={exportData} filename="دفتر_السداد" />
        <Button onClick={handleExportPDF} variant="outline" size="sm">
          <Download className="h-5 w-5" strokeWidth={1.5} />
          تصدير PDF
        </Button>
      </div>

      {/* Report Content */}
      <div
        ref={reportRef}
        className="space-y-6 p-6 bg-background rounded-lg print:p-0"
      >
        {/* Statistics Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="card-premium hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي الدفاتر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalLedgers}</div>
            </CardContent>
          </Card>
          <Card className="card-premium hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي الدفعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalPayments}</div>
            </CardContent>
          </Card>
          <Card className="card-premium hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">المسددة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.paidPayments}
              </div>
            </CardContent>
          </Card>
          <Card className="card-premium hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">غير المسددة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {stats.unpaidPayments}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ledgers List */}
        <Card className="card-premium hover-lift">
          <CardHeader>
            <CardTitle>قائمة الدفاتر الشهرية</CardTitle>
            <CardDescription>جميع الدفاتر المنشأة مع حالاتها</CardDescription>
          </CardHeader>
          <CardContent>
            {ledgersQuery.isLoading ? (
              <LoadingState message="جاري تحميل الدفاتر..." rows={4} />
            ) : ledgersQuery.data?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد دفاتر بعد
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العنوان</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>تاريخ الإنشاء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgersQuery.data?.map((ledger) => (
                      <TableRow key={ledger.id}>
                        <TableCell className="font-medium">
                          {ledger.title}
                        </TableCell>
                        <TableCell>{formatDate(ledger.monthYear)}</TableCell>
                        <TableCell>
                          {ledger.isActive ? (
                            <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30">
                              نشط
                            </Badge>
                          ) : (
                            <Badge variant="outline">غير نشط</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(ledger.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Payment Statistics */}
        <Card className="border-border/50 print:hidden">
          <CardHeader>
            <CardTitle>توزيع حالات الدفع</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Ledgers Distribution */}
        <Card className="border-border/50 print:hidden">
          <CardHeader>
            <CardTitle>توزيع الدفاتر الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="name" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
