import { Link } from "wouter";
import { Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/80 backdrop-blur-sm border-t border-border mt-auto">
      <div className="container py-8">
        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            블로그
          </Link>
          <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            FAQ
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            이용약관
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            개인정보처리방침
          </Link>
          <a 
            href="mailto:contact@riqsociety.org" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <Mail className="w-3 h-3" />
            문의
          </a>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-6"></div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} RIQ Society. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

