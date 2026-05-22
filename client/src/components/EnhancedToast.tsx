import { CheckCircle2, AlertCircle, Info, XCircle, X, Sparkles, UserPlus, UserMinus, UserCheck, Ban } from "lucide-react";
import { toast } from "sonner";

export type ToastType = "success" | "error" | "info" | "warning";

interface EnhancedToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const severityGradients: Record<ToastType, string> = {
  success: "from-emerald-500/20 via-emerald-500/5 to-transparent",
  error: "from-red-500/20 via-red-500/5 to-transparent",
  warning: "from-amber-500/20 via-amber-500/5 to-transparent",
  info: "from-blue-500/20 via-blue-500/5 to-transparent",
};

const severityIconBg: Record<ToastType, string> = {
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  error: "bg-red-500/15 text-red-600 dark:text-red-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  info: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
};

const severityBorder: Record<ToastType, string> = {
  success: "border-emerald-500/30 dark:border-emerald-400/20",
  error: "border-red-500/30 dark:border-red-400/20",
  warning: "border-amber-500/30 dark:border-amber-400/20",
  info: "border-blue-500/30 dark:border-blue-400/20",
};

const severityGlow: Record<ToastType, string> = {
  success: "shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]",
  error: "shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]",
  warning: "shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]",
  info: "shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]",
};

const severityDurations: Record<ToastType, number> = {
  success: 3500,
  error: 5000,
  info: 4000,
  warning: 4000,
};

/**
 * Premium toast notification with glassmorphism, gradient accents, and glow effects.
 */
export function showEnhancedToast(
  type: ToastType,
  options: EnhancedToastOptions
) {
  const Icon = options.icon ?? toastIcons[type];
  const duration = options.duration ?? severityDurations[type];

  return toast.custom(
    (id) => (
      <div
        className={`
          relative overflow-hidden
          flex items-start gap-3 p-4
          bg-card/95 dark:bg-card/90 backdrop-blur-xl
          text-card-foreground
          rounded-2xl border ${severityBorder[type]}
          ${severityGlow[type]}
          w-[380px] max-w-[calc(100vw-2rem)]
          animate-[toast-slide-in_400ms_cubic-bezier(0.16,1,0.3,1)_forwards]
          data-[removed=true]:animate-[toast-slide-out_250ms_ease-in_forwards]
          transition-all duration-300
          hover:scale-[1.02] hover:shadow-xl
        `}
      >
        {/* Gradient accent background */}
        <div className={`absolute inset-0 bg-gradient-to-e ${severityGradients[type]} pointer-events-none`} />
        
        {/* Animated top accent line */}
        <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-l ${
          type === "success" ? "from-emerald-400 via-emerald-500 to-emerald-600" :
          type === "error" ? "from-red-400 via-red-500 to-red-600" :
          type === "warning" ? "from-amber-400 via-amber-500 to-amber-600" :
          "from-blue-400 via-blue-500 to-blue-600"
        } animate-[shimmer_2s_ease-in-out_infinite]`} />

        {/* Icon with background */}
        <div className={`relative shrink-0 flex items-center justify-center size-10 rounded-xl ${severityIconBg[type]} transition-transform duration-300`}>
          <Icon className="size-5" strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="relative flex-1 min-w-0 pt-0.5">
          {options.title && (
            <p className="font-bold text-sm leading-tight tracking-tight">
              {options.title}
            </p>
          )}
          {options.description && (
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              {options.description}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={() => toast.dismiss(id)}
          className="relative shrink-0 rounded-lg p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-all duration-200 hover:scale-110"
          aria-label="إغلاق"
        >
          <X className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    ),
    {
      duration,
      position: "top-left",
    }
  );
}

export const toastNotifications = {
  paymentUpdated: (customerName: string) =>
    showEnhancedToast("success", {
      title: "✨ تم تحديث حالة السداد",
      description: `تم تحديث حالة ${customerName} بنجاح`,
      icon: Sparkles,
    }),

  paymentAdded: (customerName: string) =>
    showEnhancedToast("success", {
      title: "💰 تم تسجيل السداد",
      description: `تم تسجيل سداد ${customerName} بنجاح`,
      icon: CheckCircle2,
    }),

  paymentRemoved: (customerName: string) =>
    showEnhancedToast("info", {
      title: "↩️ تم إلغاء السداد",
      description: `تم إلغاء سداد ${customerName}`,
      icon: Info,
    }),

  customerAdded: (customerName: string) =>
    showEnhancedToast("success", {
      title: "🎉 تم إضافة عميل جديد",
      description: `تمت إضافة ${customerName} إلى النظام بنجاح`,
      icon: UserPlus,
    }),

  customerUpdated: (customerName: string) =>
    showEnhancedToast("success", {
      title: "✅ تم تحديث بيانات العميل",
      description: `تم تحديث بيانات ${customerName} بنجاح`,
      icon: CheckCircle2,
    }),

  customerDeleted: (customerName: string) =>
    showEnhancedToast("warning", {
      title: "🗑️ تم حذف العميل",
      description: `تم حذف ${customerName} من النظام نهائياً`,
      icon: UserMinus,
    }),

  customerActivated: (customerName: string) =>
    showEnhancedToast("success", {
      title: "🟢 تم تفعيل العميل",
      description: `تم تفعيل ${customerName} — سيظهر في الدفاتر الجديدة`,
      icon: UserCheck,
    }),

  customerDeactivated: (customerName: string) =>
    showEnhancedToast("warning", {
      title: "⏸️ تم تعطيل العميل",
      description: `تم تعطيل ${customerName} — لن يظهر في الدفاتر الجديدة`,
      icon: Ban,
    }),

  error: (message: string) =>
    showEnhancedToast("error", {
      title: "❌ حدث خطأ",
      description: message,
    }),

  loading: (message: string) =>
    toast.loading(message, {
      position: "top-left",
    }),
};
