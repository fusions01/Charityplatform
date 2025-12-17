import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Heart,
  Shield,
  CheckCircle,
  Users,
  FileSearch,
  Banknote,
  ArrowRight,
  Lock,
  Globe,
} from "lucide-react";

export default function Landing() {
  const steps = [
    {
      icon: Users,
      title: "Sign Up",
      description: "Create your account using Apple, Google, Facebook, or email. Quick and secure.",
    },
    {
      icon: FileSearch,
      title: "Submit Request",
      description: "Tell us about your situation and the assistance you need. Add supporting documents if available.",
    },
    {
      icon: Shield,
      title: "Verification",
      description: "Our team reviews your application and verifies your bank details for secure transfers.",
    },
    {
      icon: Banknote,
      title: "Receive Aid",
      description: "Once approved, funds are transferred directly to your verified bank account.",
    },
  ];

  const features = [
    {
      icon: Heart,
      title: "100% Direct Aid",
      description: "Every penny of approved aid goes directly to beneficiaries. No hidden fees or administrative cuts.",
    },
    {
      icon: Lock,
      title: "Bank-Level Security",
      description: "Your financial data is protected with 256-bit encryption and Open Banking verification.",
    },
    {
      icon: Globe,
      title: "UK & USA Compliant",
      description: "Fully compliant with charity regulations, GDPR, and financial compliance standards.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Shield className="h-4 w-4" />
                Trusted by thousands across UK & USA
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight" data-testid="text-hero-title">
                Get the Help You Need,
                <span className="block text-primary">When You Need It Most</span>
              </h1>

              <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground" data-testid="text-hero-description">
                Our community charity platform connects individuals in need with verified financial assistance.
                100% transparent. 100% secure. 100% of approved aid reaches you directly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/api/login">
                  <Button size="lg" className="gap-2 text-base px-8" data-testid="button-hero-get-help">
                    <Heart className="h-5 w-5" />
                    Request Help Now
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="gap-2 text-base px-8" data-testid="button-hero-learn-more">
                    Learn How It Works
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Verified Bank Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>100% Transparent</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>UK & US Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold" data-testid="text-section-how-it-works">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our streamlined process ensures you get help quickly and securely
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <div key={step.title} className="relative">
                  <Card className="h-full">
                    <CardContent className="pt-8 pb-6 px-6 text-center space-y-4">
                      <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <step.icon className="h-7 w-7 text-primary" />
                      </div>
                      <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="about" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold" data-testid="text-section-why-trust">
                Why Trust Community Aid
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're committed to transparency, security, and making a real difference
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="border-0 bg-gradient-to-br from-card to-muted/20">
                  <CardContent className="pt-8 pb-6 px-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Join thousands of individuals who have received support through our platform.
              Your journey to assistance begins with a single click.
            </p>
            <a href="/api/login">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 text-base px-8"
                data-testid="button-cta-apply"
              >
                Apply for Assistance
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold" data-testid="text-section-contact">
                Need Help?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our support team is here to assist you through every step of the process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button variant="outline" size="lg" data-testid="button-email-support">
                  Email Support
                </Button>
                <Button variant="outline" size="lg" data-testid="button-faq">
                  View FAQ
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
