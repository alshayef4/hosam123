import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Linkedin, Facebook, Instagram, Zap, Code2, Heart } from "lucide-react";

const DEVELOPER = {
  name: "المهندس فواز الشايف",
  phones: ["+967 736242739", "+967 773027016"],
  email: "fawaz.alshayef@gmail.com",
  linkedin: "https://www.linkedin.com/in/alshayef",
  facebook: "https://www.facebook.com/Alshayef4",
  x: "https://x.com/Alshayef4",
  instagram: "https://www.instagram.com/alshayef4",
};

export default function About() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-glow">
          <Zap className="w-10 h-10 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">دفتر السداد</h1>
          <p className="text-muted-foreground mt-2">نظام متابعة السداد الشهري الاحترافي</p>
        </div>
      </div>

      {/* About Card */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="size-5 text-primary" strokeWidth={1.5} />
            حول التطبيق
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            تطبيق دفتر السداد هو نظام احترافي لإدارة ومتابعة السداد الشهري للعملاء.
            يتيح لك إنشاء دفاتر شهرية وتتبع حالة السداد لكل عميل بسهولة.
          </p>
          <p>
            صُمم وطُوّر بأحدث التقنيات لتوفير تجربة استخدام سلسة وسريعة.
          </p>
        </CardContent>
      </Card>

      {/* Developer Card */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="size-5 text-red-500" strokeWidth={1.5} />
            المطوّر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground">{DEVELOPER.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">مهندس برمجيات</p>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <a
              href={`mailto:${DEVELOPER.email}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors duration-200"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="size-4 text-primary" strokeWidth={1.5} />
              </div>
              <span className="text-sm" dir="ltr">{DEVELOPER.email}</span>
            </a>

            {DEVELOPER.phones.map((phone, i) => (
              <a
                key={i}
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors duration-200"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Phone className="size-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-mono" dir="ltr">{phone}</span>
              </a>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <a
              href={DEVELOPER.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl text-muted-foreground hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-all duration-200 hover:scale-110"
              title="LinkedIn"
            >
              <Linkedin className="size-5" strokeWidth={1.5} />
            </a>
            <a
              href={DEVELOPER.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl text-muted-foreground hover:text-[#1877F2] hover:bg-[#1877F2]/10 transition-all duration-200 hover:scale-110"
              title="Facebook"
            >
              <Facebook className="size-5" strokeWidth={1.5} />
            </a>
            <a
              href={DEVELOPER.x}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 hover:scale-110"
              title="X (Twitter)"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href={DEVELOPER.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl text-muted-foreground hover:text-[#E4405F] hover:bg-[#E4405F]/10 transition-all duration-200 hover:scale-110"
              title="Instagram"
            >
              <Instagram className="size-5" strokeWidth={1.5} />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Copyright */}
      <p className="text-center text-xs text-muted-foreground/60">
        © {new Date().getFullYear()} جميع الحقوق محفوظة — {DEVELOPER.name}
      </p>
    </div>
  );
}
