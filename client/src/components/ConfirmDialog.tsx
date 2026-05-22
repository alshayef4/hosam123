import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default" | "warning";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  variant = "destructive",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <Trash2 className="size-5 text-destructive" strokeWidth={1.5} />;
      case "warning":
        return <AlertTriangle className="size-5 text-warning" strokeWidth={1.5} />;
      default:
        return <CheckCircle2 className="size-5 text-primary" strokeWidth={1.5} />;
    }
  };

  const getAccentBorderClass = () => {
    switch (variant) {
      case "destructive":
        return "border-t-destructive";
      case "warning":
        return "border-t-warning";
      default:
        return "border-t-primary";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent
        showCloseButton={false}
        className={cn("border-t-4", getAccentBorderClass())}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            {getIcon()}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {variant === "destructive" ? (
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? "جاري..." : confirmText}
            </Button>
          ) : variant === "warning" ? (
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm hover:-translate-y-px hover:shadow-md active:scale-[0.97] active:duration-100"
            >
              {isLoading ? "جاري..." : confirmText}
            </Button>
          ) : (
            <Button onClick={onConfirm} disabled={isLoading}>
              {isLoading ? "جاري..." : confirmText}
            </Button>
          )}
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export interface ConfirmPaymentDialogProps {
  open: boolean;
  customerName: string;
  isPaid: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmPaymentDialog({
  open,
  customerName,
  isPaid,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmPaymentDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title={isPaid ? "إلغاء السداد" : "تأكيد السداد"}
      description={
        isPaid
          ? `هل أنت متأكد من إلغاء سداد ${customerName}؟ سيتم إعادة حالته إلى "لم يتم السداد".`
          : `هل أنت متأكد من تأكيد سداد ${customerName}؟ سيتم تسجيل تاريخ السداد الحالي.`
      }
      confirmText={isPaid ? "إلغاء السداد" : "تأكيد السداد"}
      cancelText="إلغاء"
      variant={isPaid ? "warning" : "default"}
      isLoading={isLoading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

export interface ConfirmDeleteDialogProps {
  open: boolean;
  itemName: string;
  itemType: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDeleteDialog({
  open,
  itemName,
  itemType,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title={`حذف ${itemType}`}
      description={`هل أنت متأكد من حذف "${itemName}"؟ لا يمكن التراجع عن هذه العملية.`}
      confirmText="حذف"
      cancelText="إلغاء"
      variant="destructive"
      isLoading={isLoading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
