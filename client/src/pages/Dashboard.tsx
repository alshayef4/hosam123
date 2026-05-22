import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { pageTransition } from "@/lib/animations";
import { useStaggerAnimation } from "@/hooks/useStaggerAnimation";
import { useCountUp } from "@/hooks/useCountUp";
import { LoadingState } from "@/components/LoadingState";
import { CreateLedgerDialog } from "@/components/CreateLedgerDialog";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  FileText,
  TrendingUp,
  CheckCircle2,
  Plus,
  ArrowUpRight,
} from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const customersQuery = trpc.customers.list.useQuery();
  const ledgersQuery = trpc.ledgers.list.useQuery();

  const customers = customersQuery.data || [];
  const ledgers = ledgersQuery.data || [];
  const currentLedger = ledgers[0];

  // Calculate statistics
  const activeCustomers = customers.filter((c: any) => c.isActive !== false).length;
  const totalCustomers = customers.length;
  const totalLedgers = ledgers.length;
  const activeLedgers = ledgers.filter((l: any) => l.isActive).length;

  // Payment statistics from current ledger (real data from API)
  const currentLedgerStatsQuery = trpc.payments.getStats.useQuery(
    { ledgerId: currentLedger?.id },
    { enabled: !!currentLedger?.id }
  );
  const paidCount = currentLedgerStatsQuery.data?.paid || 0;
  const unpaidCount = currentLedgerStatsQuery.data?.unpaid || 0;
  const paymentPercentage = currentLedgerStatsQuery.data?.total
    ? Math.round((paidCount / currentLedgerStatsQuery.data.total) * 100)
    : 0;

  // Animated counters using useCountUp hook
  const animatedTotal = useCountUp(totalCustomers);
  const animatedLedgers = useCountUp(totalLedgers);
  const animatedPercentage = useCountUp(paymentPercentage);
  const animatedPaid = useCountUp(paidCount);

  // Staggered entrance animation for KPI cards (4 cards)
  const { containerVariants: kpiContainerVariants, itemVariants: kpiItemVariants } =
    useStaggerAnimation(4, 20);

  // Staggered entrance animation for recent ledgers list
  const { containerVariants: ledgerListContainerVariants, itemVariants: ledgerListItemVariants } =
    useStaggerAnimation(Math.min(ledgers.length, 5), 20);

  // Chart data
  const paymentStatusData = [
    { name: "تم السداد", value: paidCount, fill: "#10b981" },
    { name: "لم يتم", value: unpaidCount, fill: "#ef4444" },
  ];

  const customerStatusData = [
    { name: "نشط", value: activeCustomers, fill: "#6366f1" },
    { name: "معطل", value: totalCustomers - activeCustomers, fill: "#64748b" },
  ];

  const isLoading = customersQuery.isLoading || ledgersQuery.isLoading;

  if (isLoading) {
    return <LoadingState message="جاري تحميل البيانات..." variant="dashboard" />;
  }

  return (
    <div
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient">لوحة التحكم</h1>
        <p className="text-muted-foreground text-lg">
          مرحباً بك في نظام إدارة دفاتر السداد الشهرية
        </p>
      </div>

      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={kpiContainerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Total Customers */}
        <motion.div variants={kpiItemVariants} custom={0}>
          <Card className="card-interactive group border-border/40 overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-blue-400 to-blue-600" />
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">إجمالي العملاء</p>
                  <p className="text-4xl font-bold mt-2 animate-count-up tabular-nums">{animatedTotal}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                    {activeCustomers} نشط
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-sm">
                  <Users className="h-6 w-6 text-blue-500 dark:text-blue-400" strokeWidth={1.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Ledgers */}
        <motion.div variants={kpiItemVariants} custom={1}>
          <Card className="card-interactive group border-border/40 overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-violet-400 to-violet-600" />
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">الدفاتر الشهرية</p>
                  <p className="text-4xl font-bold mt-2 animate-count-up tabular-nums">{animatedLedgers}</p>
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" strokeWidth={1.5} />
                    {activeLedgers} نشط
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 group-hover:bg-violet-500/20 dark:group-hover:bg-violet-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-sm">
                  <FileText className="h-6 w-6 text-violet-500 dark:text-violet-400" strokeWidth={1.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Rate */}
        <motion.div variants={kpiItemVariants} custom={2}>
          <Card className="card-interactive group border-border/40 overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-cyan-400 to-cyan-600" />
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">معدل السداد</p>
                  <p className="text-4xl font-bold mt-2 animate-count-up tabular-nums">{animatedPercentage}%</p>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" strokeWidth={1.5} />
                    من الدفتر الحالي
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 group-hover:bg-cyan-500/20 dark:group-hover:bg-cyan-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-sm">
                  <TrendingUp className="h-6 w-6 text-cyan-500 dark:text-cyan-400" strokeWidth={1.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Paid Payments */}
        <motion.div variants={kpiItemVariants} custom={3}>
          <Card className="card-interactive group border-border/40 overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">المسددون</p>
                  <p className="text-4xl font-bold mt-2 animate-count-up tabular-nums">{animatedPaid}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                    من {paidCount + unpaidCount}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-sm">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 dark:text-emerald-400" strokeWidth={1.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts + Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Status Chart */}
        <Card className="card-interactive border-border/40 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">حالة السداد</CardTitle>
            <CardDescription>توزيع السداد في الدفتر الحالي</CardDescription>
          </CardHeader>
          <CardContent>
            {paidCount + unpaidCount > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <defs>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="redGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "url(#greenGradient)" : "url(#redGradient)"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto">
                    <TrendingUp className="h-6 w-6 text-muted-foreground/50" strokeWidth={1.5} />
                  </div>
                  <p>لا توجد بيانات متاحة</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Status Chart */}
        <Card className="card-interactive border-border/40 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">حالة العملاء</CardTitle>
            <CardDescription>توزيع العملاء النشطين والمعطلين</CardDescription>
          </CardHeader>
          <CardContent>
            {totalCustomers > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                    <linearGradient id="grayGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#64748b" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={customerStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {customerStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "url(#blueGradient)" : "url(#grayGradient)"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto">
                    <Users className="h-6 w-6 text-muted-foreground/50" strokeWidth={1.5} />
                  </div>
                  <p>لا توجد عملاء</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-interactive border-border/40 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
            <CardDescription>الوصول السريع للميزات الرئيسية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-full justify-start text-start bg-gradient-primary text-white hover:shadow-glow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 rounded-xl group"
            >
              <Plus className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" strokeWidth={1.5} />
              إنشاء دفتر جديد
            </Button>
            <Button
              onClick={() => setLocation("/customers")}
              variant="outline"
              className="w-full justify-start text-start hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 hover:scale-[1.02] active:scale-95 rounded-xl group"
            >
              <Users className="h-5 w-5 text-violet-500 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
              إدارة العملاء
            </Button>
            <Button
              onClick={() => setLocation("/ledgers")}
              variant="outline"
              className="w-full justify-start text-start hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 hover:scale-[1.02] active:scale-95 rounded-xl group"
            >
              <FileText className="h-5 w-5 text-cyan-500 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
              الدفاتر الشهرية
            </Button>
            <Button
              onClick={() => setLocation("/reports")}
              variant="outline"
              className="w-full justify-start text-start hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 hover:scale-[1.02] active:scale-95 rounded-xl group"
            >
              <TrendingUp className="h-5 w-5 text-emerald-500 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
              التقارير والإحصائيات
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Ledgers + Current Ledger Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Ledgers */}
        <Card className="card-interactive border-border/40">
          <CardHeader>
            <CardTitle>الدفاتر الأخيرة</CardTitle>
            <CardDescription>آخر الدفاتر الشهرية المنشأة</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              className="space-y-2"
              variants={ledgerListContainerVariants}
              initial="initial"
              animate="animate"
            >
              {ledgers.slice(0, 5).map((ledger: any, index: number) => (
                <motion.div
                  key={ledger.id}
                  variants={ledgerListItemVariants}
                  custom={index}
                  className="flex flex-row-reverse items-center justify-between p-3 rounded-xl bg-muted/30 dark:bg-muted/20 hover:bg-muted/60 dark:hover:bg-muted/40 transition-all duration-200 hover:translate-x-1 cursor-default group"
                >
                  <span className="text-sm font-medium group-hover:text-primary transition-colors duration-200">{ledger.title}</span>
                  {ledger.isActive && (
                    <span className="text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg font-medium animate-pulse-glow">
                      نشط
                    </span>
                  )}
                </motion.div>
              ))}
              {ledgers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  لا توجد دفاتر بعد
                </p>
              )}
            </motion.div>
          </CardContent>
        </Card>

        {/* Current Ledger Info */}
        {currentLedger && (
          <Card className="card-interactive border-border/40">
            <CardHeader>
              <div className="flex flex-row-reverse items-center justify-between">
                <div>
                  <CardTitle>الدفتر الحالي</CardTitle>
                  <CardDescription>
                    {new Date(currentLedger.createdAt).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "long",
                    })}
                  </CardDescription>
                </div>
                <Badge className="bg-gradient-primary text-white border-0 shadow-glow-sm">نشط</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-muted/30 dark:bg-muted/20 hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-200">
                  <p className="text-sm text-muted-foreground">إجمالي الدفعات</p>
                  <p className="text-2xl font-bold mt-2">{paidCount + unpaidCount}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 hover:bg-emerald-500/15 dark:hover:bg-emerald-500/20 transition-all duration-200">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">تم السداد</p>
                  <p className="text-2xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">{paidCount}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-red-500/10 dark:bg-red-500/15 hover:bg-red-500/15 dark:hover:bg-red-500/20 transition-all duration-200">
                  <p className="text-sm text-red-600 dark:text-red-400">لم يتم</p>
                  <p className="text-2xl font-bold mt-2 text-red-600 dark:text-red-400">{unpaidCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Ledger Dialog */}
      <CreateLedgerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => ledgersQuery.refetch()}
      />
    </div>
  );
}
