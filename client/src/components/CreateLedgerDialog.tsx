import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { showEnhancedToast } from "@/components/EnhancedToast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ledgerCreateSchema } from "@shared/schemas";

interface CreateLedgerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Internal form schema: monthYear as string from input[type="month"], converted to Date on submit
const formSchema = z.object({
  title: z.string().min(1, "عنوان الدفتر مطلوب").max(1000),
  monthYear: z.string().min(1, "الشهر والسنة مطلوب"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateLedgerDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateLedgerDialogProps) {
  const [titleError, setTitleError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      monthYear: "",
    },
  });

  const utils = trpc.useUtils();
  const createMutation = trpc.ledgers.create.useMutation();

  const handleSubmit = async (values: FormValues) => {
    setTitleError(null);

    // Check title uniqueness before submission
    try {
      const isUnique = await utils.ledgers.checkTitleUnique.fetch({
        title: values.title,
      });
      if (!isUnique) {
        setTitleError("هذا العنوان مستخدم بالفعل");
        return;
      }
    } catch {
      showEnhancedToast("error", { title: "خطأ", description: "حدث خطأ أثناء التحقق من العنوان" });
      return;
    }

    // Parse monthYear string to Date
    const monthYear = new Date(values.monthYear + "-01");

    // Validate with shared schema
    const parsed = ledgerCreateSchema.safeParse({
      title: values.title,
      monthYear,
    });

    if (!parsed.success) {
      showEnhancedToast("error", { title: "خطأ", description: "بيانات غير صالحة" });
      return;
    }

    try {
      await createMutation.mutateAsync(parsed.data);
      showEnhancedToast("success", { title: "📒 تم إنشاء الدفتر", description: "تم إنشاء الدفتر الشهري بنجاح" });
      form.reset();
      setTitleError(null);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      showEnhancedToast("error", { title: "خطأ", description: "حدث خطأ أثناء إنشاء الدفتر" });
    }
  };

  const isSubmitting = createMutation.isPending || form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إنشاء دفتر شهري جديد</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الدفتر</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="مثال: دفتر شهر مايو 2024"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (titleError) setTitleError(null);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {titleError && (
                    <p className="text-destructive text-sm">{titleError}</p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الشهر والسنة</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="month"
                        className="pe-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        {...field}
                      />
                      <div className="absolute top-1/2 end-3 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                      </div>
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground">اختر الشهر والسنة للدفتر</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
                )}
                إنشاء
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
