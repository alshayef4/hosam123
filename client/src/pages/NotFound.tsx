import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-mesh bg-background">
      <Card className="w-full max-w-lg mx-4 shadow-lg border-0 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 dark:bg-red-500/20 rounded-full animate-pulse" />
              <AlertCircle className="relative size-12 text-red-500" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>

          <h2 className="text-xl font-semibold text-foreground/80 mb-4">
            الصفحة غير موجودة
          </h2>

          <p className="text-muted-foreground mb-8 leading-relaxed">
            عذراً، الصفحة التي تبحث عنها غير موجودة.
            <br />
            ربما تم نقلها أو حذفها.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleGoHome}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Home className="w-5 h-5" strokeWidth={1.5} />
              الرئيسية
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
