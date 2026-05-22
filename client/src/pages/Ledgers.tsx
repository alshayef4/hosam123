import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Eye, BookOpen } from "lucide-react";
import { useLocation } from "wouter";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/DataTable";
import { CreateLedgerDialog } from "@/components/CreateLedgerDialog";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { ExportButtons } from "@/components/ExportButtons";
import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/formatDate";
import { pageTransition } from "@/lib/animations";

interface Ledger {
  id: string;
  title: string;
  monthYear: Date | string;
  isActive: boolean;
  createdAt?: Date | string;
}

export default function Ledgers() {
  const [, navigate] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const ledgersQuery = trpc.ledgers.list.useQuery();

  const handleViewLedger = (ledgerId: string) => {
    navigate(`/ledger/${ledgerId}`);
  };

  const exportData = useMemo(() => {
    if (!ledgersQuery.data || ledgersQuery.data.length === 0) return [];
    return ledgersQuery.data.map((ledger) => ({
      "عنوان الدفتر": ledger.title,
      "الشهر والسنة": formatDate(ledger.monthYear),
      "الحالة": ledger.isActive ? "نشط" : "مؤرشف",
    }));
  }, [ledgersQuery.data]);

  const columns: ColumnDef<Ledger>[] = [
    {
      key: "title",
      label: "العنوان",
      sortable: true,
      render: (ledger) => (
        <span className="font-medium">{ledger.title}</span>
      ),
    },
    {
      key: "monthYear",
      label: "التاريخ",
      sortable: true,
      render: (ledger) => formatDate(ledger.monthYear),
    },
    {
      key: "isActive",
      label: "الحالة",
      sortable: true,
      render: (ledger) =>
        ledger.isActive ? (
          <Badge className="bg-gradient-success text-white">نشط</Badge>
        ) : (
          <Badge variant="secondary">غير نشط</Badge>
        ),
    },
    {
      key: "id",
      label: "الإجراءات",
      render: (ledger) => (
        <button
          onClick={() => handleViewLedger(ledger.id)}
          className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover-lift"
          title="عرض"
        >
          <Eye className="h-4 w-4" strokeWidth={1.5} />
        </button>
      ),
    },
  ];

  const searchFilter = useCallback((item: Ledger, query: string) => {
    return item.title.toLowerCase().includes(query.toLowerCase());
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gradient">
          الدفاتر الشهرية
        </h1>
        <p className="text-muted-foreground text-lg">
          إدارة ومتابعة الدفاتر الشهرية بسهولة
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-row-reverse gap-2">
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary text-white px-4 py-2.5 text-sm font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" strokeWidth={1.5} />
          إنشاء دفتر شهري جديد
        </button>
        <ExportButtons data={exportData} filename="الدفاتر" />
      </div>

      {/* Create Ledger Dialog */}
      <CreateLedgerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => ledgersQuery.refetch()}
      />

      {/* Ledgers Table */}
      <Card className="card-premium">
        <CardHeader className="border-b border-border/50">
          <CardTitle>قائمة الدفاتر</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {ledgersQuery.isLoading ? (
            <LoadingState message="جاري تحميل الدفاتر..." rows={5} />
          ) : ledgersQuery.data?.length === 0 ? (
            <EmptyState
              message="لا توجد دفاتر بعد"
              actionLabel="إنشاء دفتر شهري جديد"
              onAction={() => setIsCreateDialogOpen(true)}
              icon={BookOpen}
            />
          ) : (
            <DataTable<Ledger>
              data={(ledgersQuery.data as Ledger[]) ?? []}
              columns={columns}
              pageSize={20}
              searchFilter={searchFilter}
              searchPlaceholder="بحث بعنوان الدفتر..."
              emptyState={{
                message: "لا توجد دفاتر بعد",
                actionLabel: "إنشاء دفتر شهري جديد",
                onAction: () => setIsCreateDialogOpen(true),
                icon: BookOpen,
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
