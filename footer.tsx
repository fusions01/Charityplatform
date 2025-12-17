import { Heart, Shield, Lock, FileCheck } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">Community Aid</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting those in need with verified charitable support. 100% of donations reach beneficiaries.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/#how-it-works" className="hover:text-foreground transition-colors" data-testid="link-footer-how-it-works">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#about" className="hover:text-foreground transition-colors" data-testid="link-footer-about">
                  About Us
                </a>
              </li>
              <li>
                <a href="/#contact" className="hover:text-foreground transition-colors" data-testid="link-footer-contact">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-footer-privacy">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-foreground transition-colors" data-testid="link-footer-terms">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/cookies" className="hover:text-foreground transition-colors" data-testid="link-footer-cookies">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Trust & Security</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>UK & US Compliant</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span>256-bit Encryption</span>
              </li>
              <li className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-primary" />
                <span>Verified Recipients</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p data-testid="text-copyright">&copy; {currentYear} Community Aid Platform. All rights reserved.</p>
          <p>Registered Charity</p>
        </div>
      </div>
    </footer>
  );
}
