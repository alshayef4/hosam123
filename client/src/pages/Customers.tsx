import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Users, Loader2, CheckCircle2, XCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { DataTable, type ColumnDef } from "@/components/DataTable";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { ExportButtons } from "@/components/ExportButtons";
import { ConfirmDialog } from "@/components/ConfirmDialog";

import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/formatDate";
import { pageTransition } from "@/lib/animations";
import { useStaggerAnimation } from "@/hooks/useStaggerAnimation";
import { customerCreateSchema } from "@shared/schemas";
import { toastNotifications } from "@/components/EnhancedToast";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  userId: number;
  fullName: string;
  phoneNumber: string;
  notes: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface DeleteConfirmState {
  open: boolean;
  customerId: string;
  customerName: string;
}

interface ToggleConfirmState {
  open: boolean;
  customerId: string;
  customerName: string;
  isActive: boolean;
}

// ─── Form Schema (reuse shared schema for create; edit uses same fields) ─────

type CustomerFormValues = z.infer<typeof customerCreateSchema>;

// ─── Component ───────────────────────────────────────────────────────────────

export default function Customers() {
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Confirm dialogs
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    open: false,
    customerId: "",
    customerName: "",
  });
  const [toggleConfirm, setToggleConfirm] = useState<ToggleConfirmState>({
    open: false,
    customerId: "",
    customerName: "",
    isActive: true,
  });

  // react-hook-form with Zod resolver
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerCreateSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      notes: "",
    },
  });

  // API Hooks
  const customersQuery = trpc.customers.list.useQuery();
  const createMutation = trpc.customers.create.useMutation();
  const updateMutation = trpc.customers.update.useMutation();
  const deleteMutation = trpc.customers.delete.useMutation();
  const toggleActiveMutation = trpc.customers.toggleActive.useMutation();

  // Staggered entrance animation for header items (must be before early returns)
  const { containerVariants: headerContainerVariants, itemVariants: headerItemVariants } =
    useStaggerAnimation(2, 20);

  // ─── Dialog Handlers ─────────────────────────────────────────────────────

  const handleOpenCreate = useCallback(() => {
    setEditingId(null);
    form.reset({ fullName: "", phoneNumber: "", notes: "" });
    setIsDialogOpen(true);
  }, [form]);

  const handleOpenEdit = useCallback(
    (customer: Customer) => {
      setEditingId(customer.id);
      form.reset({
        fullName: customer.fullName || "",
        phoneNumber: customer.phoneNumber || "",
        notes: customer.notes || "",
      });
      setIsDialogOpen(true);
    },
    [form]
  );

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingId(null);
    form.reset({ fullName: "", phoneNumber: "", notes: "" });
  }, [form]);

  // ─── Form Submission ─────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (values: CustomerFormValues) => {
      try {
        if (editingId) {
          await updateMutation.mutateAsync({
            id: editingId,
            fullName: values.fullName.trim(),
            phoneNumber: values.phoneNumber.trim(),
            notes: values.notes?.trim() || undefined,
          });
          toastNotifications.customerUpdated(values.fullName);
        } else {
          await createMutation.mutateAsync({
            fullName: values.fullName.trim(),
            phoneNumber: values.phoneNumber.trim(),
            notes: values.notes?.trim() || undefined,
          });
          toastNotifications.customerAdded(values.fullName);
        }

        handleCloseDialog();
        await customersQuery.refetch();
      } catch (error: any) {
        const errorMessage = error?.message || "حدث خطأ أثناء حفظ العميل";
        toastNotifications.error(errorMessage);
      }
    },
    [editingId, updateMutation, createMutation, customersQuery, handleCloseDialog]
  );

  // ─── Delete Handlers ─────────────────────────────────────────────────────

  const handleDeleteClick = useCallback((id: string, name: string) => {
    setDeleteConfirm({ open: true, customerId: id, customerName: name });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      await deleteMutation.mutateAsync({ id: deleteConfirm.customerId });
      toastNotifications.customerDeleted(deleteConfirm.customerName);
      await customersQuery.refetch();
    } catch (error: any) {
      const errorMessage = error?.message || "حدث خطأ أثناء حذف العميل";
      toastNotifications.error(errorMessage);
    } finally {
      setDeleteConfirm({ open: false, customerId: "", customerName: "" });
    }
  }, [deleteConfirm, deleteMutation, customersQuery]);

  // ─── Toggle Active Handlers ──────────────────────────────────────────────

  const handleToggleActiveClick = useCallback((customer: Customer) => {
    setToggleConfirm({
      open: true,
      customerId: customer.id,
      customerName: customer.fullName,
      isActive: customer.isActive ?? true,
    });
  }, []);

  const handleConfirmToggleActive = useCallback(async () => {
    const newStatus = !toggleConfirm.isActive;
    try {
      await toggleActiveMutation.mutateAsync({
        id: toggleConfirm.customerId,
        isActive: newStatus,
      });
      if (newStatus) {
        toastNotifications.customerActivated(toggleConfirm.customerName);
      } else {
        toastNotifications.customerDeactivated(toggleConfirm.customerName);
      }
      await customersQuery.refetch();
    } catch (error: any) {
      const errorMessage = error?.message || "حدث خطأ أثناء تحديث حالة العميل";
      toastNotifications.error(errorMessage);
    } finally {
      setToggleConfirm({ open: false, customerId: "", customerName: "", isActive: true });
    }
  }, [toggleConfirm, toggleActiveMutation, customersQuery]);

  // ─── Export Data ─────────────────────────────────────────────────────────

  const exportData = useMemo(() => {
    if (!customersQuery.data) return [];
    return customersQuery.data.map((customer: any) => ({
      "الاسم الكامل": customer.fullName,
      "رقم الهاتف": customer.phoneNumber,
      "الحالة": customer.isActive ? "نشط" : "معطل",
      "تاريخ الإنشاء": formatDate(customer.createdAt),
      "الملاحظات": customer.notes || "—",
    }));
  }, [customersQuery.data]);

  // ─── DataTable Columns ───────────────────────────────────────────────────

  const columns: ColumnDef<Customer>[] = useMemo(
    () => [
      {
        key: "fullName",
        label: "الاسم",
        sortable: true,
        render: (customer) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-foreground text-base">{customer.fullName}</span>
            <span className="text-xs text-muted-foreground font-mono" dir="ltr">{customer.phoneNumber}</span>
          </div>
        ),
      },
      {
        key: "phoneNumber",
        label: "رقم الجوال",
        sortable: true,
        render: (customer) => (
          <span className="text-muted-foreground font-mono text-sm tabular-nums" dir="ltr">{customer.phoneNumber}</span>
        ),
      },
      {
        key: "isActive",
        label: "الحالة",
        sortable: true,
        render: (customer) => (
          <button
            onClick={() => handleToggleActiveClick(customer)}
            disabled={toggleActiveMutation.isPending}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              customer.isActive
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-500/25 ring-1 ring-emerald-500/25 hover:bg-emerald-500/25 dark:hover:bg-emerald-500/35 hover:ring-emerald-500/40"
                : "bg-gray-500/10 text-gray-600 dark:text-gray-400 dark:bg-gray-500/20 ring-1 ring-gray-500/15 hover:bg-gray-500/20 dark:hover:bg-gray-500/30 hover:ring-gray-500/30"
            }`}
            aria-label={customer.isActive ? `تعطيل ${customer.fullName}` : `تفعيل ${customer.fullName}`}
          >
            <span className={`flex items-center justify-center size-5 rounded-full transition-colors duration-200 ${
              customer.isActive
                ? "bg-emerald-500 text-white"
                : "bg-gray-400 dark:bg-gray-500 text-white"
            }`}>
              {customer.isActive ? (
                <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </span>
            {customer.isActive ? "نشط" : "معطل"}
          </button>
        ),
      },
      {
        key: "createdAt",
        label: "تاريخ الإنشاء",
        sortable: true,
        render: (customer) => (
          <span className="text-muted-foreground text-sm">
            {formatDate(customer.createdAt)}
          </span>
        ),
      },
      {
        key: "id",
        label: "الإجراءات",
        sortable: false,
        render: (customer) => (
          <div className="flex flex-row-reverse items-center gap-1.5">
            <button
              onClick={() => handleOpenEdit(customer)}
              className="inline-flex items-center justify-center rounded-xl p-2.5 hover:bg-primary/10 dark:hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              disabled={updateMutation.isPending || deleteMutation.isPending}
              aria-label={`تعديل ${customer.fullName}`}
            >
              <Edit2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => handleDeleteClick(customer.id, customer.fullName)}
              className="inline-flex items-center justify-center rounded-xl p-2.5 hover:bg-red-500/10 dark:hover:bg-red-500/15 text-muted-foreground hover:text-red-500 transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              disabled={updateMutation.isPending || deleteMutation.isPending}
              aria-label={`حذف ${customer.fullName}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        ),
      },
    ],
    [handleOpenEdit, handleDeleteClick, handleToggleActiveClick, toggleActiveMutation.isPending, updateMutation.isPending, deleteMutation.isPending]
  );

  // ─── Search Filter ───────────────────────────────────────────────────────

  const searchFilter = useCallback((customer: Customer, query: string) => {
    const q = query.toLowerCase();
    return (
      (customer.fullName || "").toLowerCase().includes(q) ||
      (customer.phoneNumber || "").includes(q)
    );
  }, []);

  // ─── Loading State ───────────────────────────────────────────────────────

  if (customersQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-gradient">إدارة العملاء</h1>
          <p className="text-muted-foreground">جاري تحميل قائمة العملاء...</p>
        </div>
        <Card className="card-interactive border-border/40">
          <CardContent className="py-12">
            <LoadingState message="جاري تحميل قائمة العملاء..." rows={5} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────────────

  if (customersQuery.isError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-gradient">إدارة العملاء</h1>
          <p className="text-muted-foreground">حدث خطأ أثناء تحميل البيانات</p>
        </div>
        <Card className="border-red-500/20 bg-red-500/5 dark:bg-red-500/10 rounded-xl">
          <CardContent className="py-6">
            <EmptyState
              message="فشل تحميل قائمة العملاء. يرجى المحاولة مرة أخرى لاحقاً"
              actionLabel="إعادة المحاولة"
              onAction={() => customersQuery.refetch()}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const customers = (customersQuery.data ?? []) as Customer[];

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col gap-2"
        variants={headerContainerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.h1
          className="text-4xl md:text-5xl font-bold tracking-tight text-gradient"
          variants={headerItemVariants}
          custom={0}
        >
          إدارة العملاء
        </motion.h1>
        <motion.p className="text-muted-foreground" variants={headerItemVariants} custom={1}>
          إدارة قائمة العملاء والمشتركين في النظام
        </motion.p>
      </motion.div>

      {/* Main Card */}
      <motion.div variants={headerItemVariants} custom={2}>
        <Card className="card-premium">
          <CardHeader className="border-b border-border/30">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>العملاء ({customers.length})</CardTitle>
                <CardDescription>
                  قائمة جميع العملاء والمشتركين في النظام
                </CardDescription>
              </div>
              <div className="flex flex-row-reverse gap-2">
                <Button
                  onClick={handleOpenCreate}
                  className="bg-gradient-primary text-white hover:shadow-glow-sm transition-all duration-200 hover:scale-105 active:scale-95 rounded-xl group"
                >
                  <Plus className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" strokeWidth={1.5} />
                  إضافة عميل
                </Button>
                <ExportButtons data={exportData} filename="العملاء" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {customers.length === 0 ? (
              <EmptyState
                message="لا توجد عملاء حالياً"
                actionLabel="إضافة عميل جديد"
                onAction={handleOpenCreate}
                icon={Users}
              />
            ) : (
              <DataTable<Customer>
                data={customers}
                columns={columns}
                pageSize={20}
                searchFilter={searchFilter}
                searchPlaceholder="ابحث بالاسم أو رقم الجوال..."
                emptyState={{
                  message: "لا توجد عملاء حالياً",
                  actionLabel: "إضافة عميل جديد",
                  onAction: handleOpenCreate,
                  icon: Users,
                }}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Customer Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="direction-rtl max-w-md rounded-2xl">
          <DialogHeader className="text-start">
            <DialogTitle className="text-gradient">
              {editingId ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
            </DialogTitle>
            <DialogDescription className="text-start">
              {editingId
                ? "قم بتحديث بيانات العميل"
                : "أدخل بيانات العميل الجديد"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل الاسم الكامل"
                        dir="rtl"
                        className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الجوال</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل رقم الجوال"
                        dir="rtl"
                        className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أدخل أي ملاحظات إضافية"
                        className="min-h-24 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                        dir="rtl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Buttons */}
              <div className="flex flex-row-reverse gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="flex-1 rounded-xl"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex-1 bg-gradient-primary text-white rounded-xl hover:shadow-glow-sm transition-all duration-200"
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
                  )}
                  حفظ
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="حذف العميل"
        description={`هل أنت متأكد من حذف العميل "${deleteConfirm.customerName}"؟ هذه العملية لا يمكن التراجع عنها.`}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirm({ open: false, customerId: "", customerName: "" })
        }
        isLoading={deleteMutation.isPending}
        variant="destructive"
        confirmText="حذف"
        cancelText="إلغاء"
      />

      {/* Toggle Active Confirmation Dialog */}
      <ConfirmDialog
        open={toggleConfirm.open}
        title={toggleConfirm.isActive ? "تعطيل المشترك" : "تفعيل المشترك"}
        description={
          toggleConfirm.isActive
            ? `هل أنت متأكد من تعطيل ${toggleConfirm.customerName}؟ لن يظهر في الدفاتر الجديدة.`
            : `هل أنت متأكد من تفعيل ${toggleConfirm.customerName}؟ سيظهر في الدفاتر الجديدة.`
        }
        confirmText={toggleConfirm.isActive ? "تعطيل" : "تفعيل"}
        cancelText="إلغاء"
        variant={toggleConfirm.isActive ? "warning" : "default"}
        isLoading={toggleActiveMutation.isPending}
        onConfirm={handleConfirmToggleActive}
        onCancel={() =>
          setToggleConfirm({ open: false, customerId: "", customerName: "", isActive: true })
        }
      />
    </div>
  );
}
