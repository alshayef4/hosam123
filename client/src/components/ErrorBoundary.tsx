import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 bg-background"
        >
          <AlertCircle className="size-12 text-destructive" strokeWidth={1.5} />

          <h1 className="text-2xl font-bold text-foreground">
            حدث خطأ غير متوقع
          </h1>

          <p className="text-muted-foreground text-center max-w-md">
            نعتذر عن هذا الخطأ، يرجى إعادة تحميل الصفحة
          </p>

          <button
            onClick={() => window.location.reload()}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg mt-4",
              "bg-primary text-primary-foreground font-medium",
              "hover:opacity-90 cursor-pointer transition-opacity"
            )}
          >
            إعادة تحميل
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
