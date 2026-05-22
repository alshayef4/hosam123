import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/formatDate";
import { pageTransition } from "@/lib/animations";
import { useStaggerAnimation } from "@/hooks/useStaggerAnimation";
import { useCountUp } from "@/hooks/useCountUp";
import { toastNotifications } from "@/components/EnhancedToast";

import { DataTable, ColumnDef } from "@/components/DataTable";
import { ExportButtons } from "@/components/ExportButtons";
import { LoadingState } from "@/components/LoadingState";
import { ConfirmPaymentDialog } from "@/components/ConfirmDialog";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- Types ---

interface PaymentRow {
  id: string;
  customerName: string;
  phoneNumber: string;
  isPaid: boolean;
  paymentDate: string | null;
  notes: string | null;
}

// --- Component ---

export default function LedgerDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const ledgerId = params?.ledgerId as string;
  const queryClient = useQueryClient();

  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "unpaid">("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    paymentId: string;
    isPaid: boolean;
    customerName: string;
  }>({
    open: false,
    paymentId: "",
    isPaid: false,
    customerName: "",
  });

  // --- Queries ---
  const paymentsQuery = trpc.payments.listByLedger.useQuery({ ledgerId });
  const statsQuery = trpc.payments.getStats.useQuery({ ledgerId });
  const ledgersQuery = trpc.ledgers.list.useQuery();

  // Get current ledger title from the ledgers list
  const ledgerTitle = useMemo(() => {
    if (!ledgersQuery.data) return "الدفتر";
    const ledger = ledgersQuery.data.find((l: any) => l.id === ledgerId);
    return ledger?.title || "الدفتر";
  }, [ledgersQuery.data, ledgerId]);

  // Staggered entrance animation for stats cards
  const { containerVariants: statsContainerVariants, itemVariants: statsItemVariants } =
    useStaggerAnimation(4, 20);

  // Animated KPI values
  const animatedTotal = useCountUp(statsQuery.data?.total || 0);
  const animatedPaid = useCountUp(statsQuery.data?.paid || 0);
  const animatedUnpaid = useCountUp(statsQuery.data?.unpaid || 0);
  const animatedPercentage = useCountUp(
    statsQuery.data && statsQuery.data.total > 0
      ? Math.round((statsQuery.data.paid / statsQuery.data.total) * 100)
      : 0
  );

  // --- Optimistic Update Mutation ---
  const updatePaymentMutation = trpc.payments.update.useMutation({
    onMutate: async ({ id, isPaid }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [["payments", "listByLedger"], { input: { ledgerId }, type: "query" }] });

      // Snapshot previous value
      const previousPayments = queryClient.getQueryData([["payments", "listByLedger"], { input: { ledgerId }, type: "query" }]);

      // Optimistically update the cache
      queryClient.setQueryData(
        [["payments", "listByLedger"], { input: { ledgerId }, type: "query" }],
        (old: any) => {
          if (!old) return old;
          return old.map((p: any) =>
            p.id === id
              ? { ...p, isPaid: isPaid, paymentDate: isPaid ? new Date().toISOString() : null }
              : p
          );
        }
      );

      return { previousPayments };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousPayments) {
        queryClient.setQueryData(
          [["payments", "listByLedger"], { input: { ledgerId }, type: "query" }],
          context.previousPayments
        );
      }
      toastNotifications.error("فشل تحديث حالة الدفع، تم التراجع عن التغيير");
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: [["payments", "listByLedger"], { input: { ledgerId }, type: "query" }] });
      queryClient.invalidateQueries({ queryKey: [["payments", "getStats"], { input: { ledgerId }, type: "query" }] });
    },
  });

  // --- Handlers ---

  const handleTogglePaymentClick = (
    paymentId: string,
    isPaid: boolean,
    customerName: string
  ) => {
    setConfirmDialog({ open: true, paymentId, isPaid, customerName });
  };

  const handleConfirmPayment = async () => {
    const { paymentId, isPaid, customerName } = confirmDialog;

    updatePaymentMutation.mutate({
      id: paymentId,
      isPaid: !isPaid,
      paymentDate: !isPaid ? new Date() : undefined,
    });

    if (isPaid) {
      toastNotifications.paymentRemoved(customerName);
    } else {
      toastNotifications.paymentAdded(customerName);
    }

    setConfirmDialog({ open: false, paymentId: "", isPaid: false, customerName: "" });
  };

  // --- Transform data for DataTable ---

  const tableData: PaymentRow[] = useMemo(() => {
    if (!paymentsQuery.data) return [];

    const allPayments = paymentsQuery.data.map((item: any) => ({
      id: item.id,
      customerName: item.customers?.fullName || "—",
      phoneNumber: item.customers?.phoneNumber || "—",
      isPaid: item.isPaid,
      paymentDate: item.paymentDate,
      notes: item.notes,
    }));

    // Apply status filter
    if (filterStatus === "paid") return allPayments.filter((p) => p.isPaid);
    if (filterStatus === "unpaid") return allPayments.filter((p) => !p.isPaid);
    return allPayments;
  }, [paymentsQuery.data, filterStatus]);

  // --- Export data ---

  const exportData = useMemo(() => {
    return tableData.map((row) => ({
      "اسم العميل": row.customerName,
      "رقم الجوال": row.phoneNumber,
      "حالة السداد": row.isPaid ? "مدفوع" : "غير مدفوع",
      "تاريخ السداد": row.paymentDate ? formatDate(row.paymentDate) : "—",
      "ملاحظات": row.notes || "—",
    }));
  }, [tableData]);

  // --- DataTable columns ---

  const columns: ColumnDef<PaymentRow>[] = [
    {
      key: "customerName",
      label: "اسم العميل",
      sortable: true,
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-foreground text-base">{item.customerName}</span>
          <span className="text-xs text-muted-foreground" dir="ltr">{item.phoneNumber}</span>
        </div>
      ),
    },
    {
      key: "phoneNumber",
      label: "رقم الجوال",
      sortable: false,
      render: (item) => (
        <span className="font-mono text-sm text-muted-foreground tabular-nums" dir="ltr">
          {item.phoneNumber}
        </span>
      ),
    },
    {
      key: "isPaid",
      label: "حالة السداد",
      sortable: true,
      render: (item) => (
        <button
          onClick={() => handleTogglePaymentClick(item.id, item.isPaid, item.customerName)}
          disabled={updatePaymentMutation.isPending}
          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            item.isPaid
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-500/25 ring-1 ring-emerald-500/25 hover:bg-emerald-500/25 dark:hover:bg-emerald-500/35 hover:ring-emerald-500/40"
              : "bg-red-500/10 text-red-700 dark:text-red-300 dark:bg-red-500/20 ring-1 ring-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-500/30 hover:ring-red-500/30"
          }`}
          aria-label={item.isPaid ? `إلغاء سداد ${item.customerName}` : `تأكيد سداد ${item.customerName}`}
        >
          <span className={`flex items-center justify-center size-5 rounded-full transition-colors duration-200 ${
            item.isPaid
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          }`}>
            {item.isPaid ? (
              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </span>
          {item.isPaid ? "تم السداد" : "لم يُسدد"}
        </button>
      ),
    },
    {
      key: "paymentDate",
      label: "تاريخ السداد",
      sortable: true,
      render: (item) => (
        <span className={`text-sm ${item.paymentDate ? "text-foreground font-medium" : "text-muted-foreground"}`}>
          {item.paymentDate ? formatDate(item.paymentDate) : "—"}
        </span>
      ),
    },
    {
      key: "notes",
      label: "ملاحظات",
      sortable: false,
      render: (item) => (
        <span className="text-muted-foreground text-sm">
          {item.notes || "—"}
        </span>
      ),
    },
  ];

  // --- Loading state ---

  if (paymentsQuery.isLoading || statsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState message="جاري تحميل تفاصيل الدفتر..." rows={8} />
      </div>
    );
  }

  // --- Render ---

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/ledgers");
              }}
            >
              الدفاتر
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{ledgerTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{ledgerTitle}</h1>
          <p className="text-muted-foreground">إدارة حالات السداد ومتابعة العملاء</p>
        </div>
        <ExportButtons data={exportData} filename={`دفتر-${ledgerTitle}`} />
      </div>

      {/* Stats Cards */}
      <motion.div
        className="grid gap-4 md:grid-cols-4"
        variants={statsContainerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={statsItemVariants} custom={0}>
          <Card className="overflow-hidden border-border/40">
            <div className="h-[3px] bg-gradient-to-r from-blue-400 to-blue-600" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي العملاء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">{animatedTotal}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={statsItemVariants} custom={1}>
          <Card className="overflow-hidden border-emerald-500/20 dark:border-emerald-500/15">
            <div className="h-[3px] bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                ✓ تم السداد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {animatedPaid}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={statsItemVariants} custom={2}>
          <Card className="overflow-hidden border-red-500/20 dark:border-red-500/15">
            <div className="h-[3px] bg-gradient-to-r from-red-400 to-red-600" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-red-600 dark:text-red-400">
                ✗ لم يتم السداد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                {animatedUnpaid}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={statsItemVariants} custom={3}>
          <Card className="overflow-hidden border-border/40">
            <div className="h-[3px] bg-gradient-to-r from-violet-400 to-violet-600" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                نسبة السداد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">
                {animatedPercentage}%
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-muted/50 dark:bg-muted/30 rounded-xl w-fit">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            filterStatus === "all"
              ? "bg-card dark:bg-card shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          الكل ({statsQuery.data?.total || 0})
        </button>
        <button
          onClick={() => setFilterStatus("paid")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            filterStatus === "paid"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          مدفوع ({statsQuery.data?.paid || 0})
        </button>
        <button
          onClick={() => setFilterStatus("unpaid")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            filterStatus === "unpaid"
              ? "bg-red-500/10 text-red-700 dark:text-red-400 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          غير مدفوع ({statsQuery.data?.unpaid || 0})
        </button>
      </div>

      {/* Payments DataTable */}
      <DataTable<PaymentRow>
        data={tableData}
        columns={columns}
        pageSize={20}
        searchFilter={(item, query) =>
          item.customerName.toLowerCase().includes(query.toLowerCase()) ||
          item.phoneNumber.includes(query)
        }
        searchPlaceholder="ابحث بالاسم أو رقم الجوال..."
        emptyState={{
          message: "لا توجد مدفوعات في هذا الدفتر",
        }}
      />

      {/* Confirmation Dialog */}
      <ConfirmPaymentDialog
        open={confirmDialog.open}
        customerName={confirmDialog.customerName}
        isPaid={confirmDialog.isPaid}
        isLoading={updatePaymentMutation.isPending}
        onConfirm={handleConfirmPayment}
        onCancel={() =>
          setConfirmDialog({ open: false, paymentId: "", isPaid: false, customerName: "" })
        }
      />
    </div>
  );
}
