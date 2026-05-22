import { Mail, Phone, Linkedin, Facebook, Instagram } from "lucide-react";

const DEVELOPER = {
  name: "المهندس فواز الشايف",
  phones: ["+967 736242739", "+967 773027016"],
  email: "fawaz.alshayef@gmail.com",
  linkedin: "https://www.linkedin.com/in/alshayef",
  facebook: "https://www.facebook.com/Alshayef4",
  x: "https://x.com/Alshayef4",
  instagram: "https://www.instagram.com/alshayef4",
};

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm mt-auto">
      <div className="px-6 py-6">
        {/* Copyright */}
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            صُمم وطُوّر بواسطة{" "}
            <span className="font-bold text-foreground">{DEVELOPER.name}</span>
          </p>

          {/* Contact Links */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <a
              href={`mailto:${DEVELOPER.email}`}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
              title="البريد الإلكتروني"
            >
              <Mail className="size-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">{DEVELOPER.email}</span>
            </a>
            <a
              href={`tel:${DEVELOPER.phones[0].replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
              title="الهاتف"
              dir="ltr"
            >
              <Phone className="size-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">{DEVELOPER.phones[0]}</span>
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            <a
              href={DEVELOPER.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-all duration-200"
              title="LinkedIn"
            >
              <Linkedin className="size-4" strokeWidth={1.5} />
            </a>
            <a
              href={DEVELOPER.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground hover:text-[#1877F2] hover:bg-[#1877F2]/10 transition-all duration-200"
              title="Facebook"
            >
              <Facebook className="size-4" strokeWidth={1.5} />
            </a>
            <a
              href={DEVELOPER.x}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
              title="X (Twitter)"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href={DEVELOPER.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground hover:text-[#E4405F] hover:bg-[#E4405F]/10 transition-all duration-200"
              title="Instagram"
            >
              <Instagram className="size-4" strokeWidth={1.5} />
            </a>
          </div>

          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}
