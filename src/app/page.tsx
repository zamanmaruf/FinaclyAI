"use client";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  ArrowRight, 
  CreditCard, 
  Sparkles, 
  Banknote, 
  FileText,
  Link,
  Activity,
  Globe,
  Shield,
  CheckCircle2,
  Star,
  Lock
} from "lucide-react";

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">{title}</h2>
      {subtitle && <p className="mt-3 text-gray-600 text-lg">{subtitle}</p>}
    </div>
  );
}

export default function HomePage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden min-h-[70vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500" />
          <div className="absolute inset-0 bg-black/10" />
          
          <div className="relative container py-24 md:py-32 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                Reconcile Stripe, Bank, and QuickBooks—in seconds.
              </h1>
              <p className="mt-6 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
                Finacly AI auto-matches payouts, charges, and accounting entries so month-end takes minutes, not days.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => scrollToSection("waitlist")}
                  variant="primary"
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
                >
                  Join Waitlist
                </Button>
                <Button
                  onClick={() => scrollToSection("how-it-works")}
                  variant="secondary"
                  size="lg"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  See How It Works <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Bank-level security</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>SOC 2 in progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Built for accountants</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="container py-16 md:py-24">
          <SectionTitle
            title="Finacly in Action"
            subtitle="127 Stripe transactions worth $5,000 auto-matched to 1 bank deposit and 127 QuickBooks invoices—in seconds, 0 errors."
          />
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <Card variant="elevated" className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Stripe</h3>
              <p className="text-gray-600">Transactions & payouts</p>
            </Card>
            
            <div className="flex items-center justify-center">
              <ArrowRight className="h-8 w-8 text-gray-400 hidden md:block" />
              <ArrowRight className="h-6 w-6 text-gray-400 block md:hidden rotate-90" />
            </div>
            
            <Card variant="elevated" className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Finacly AI</h3>
              <p className="text-gray-600">AI auto-match engine</p>
            </Card>
            
            <div className="hidden md:block" />
            
            <div className="flex items-center justify-center">
              <ArrowRight className="h-8 w-8 text-gray-400 hidden md:block" />
              <ArrowRight className="h-6 w-6 text-gray-400 block md:hidden rotate-90" />
            </div>
            
            <Card variant="elevated" className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <div className="flex items-center gap-1">
                    <Banknote className="h-5 w-5 text-emerald-600" />
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bank + QuickBooks</h3>
              <p className="text-gray-600">Deposits & records</p>
              <div className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                <CheckCircle2 className="h-4 w-4" /> 127 matched / 0 errors
              </div>
            </Card>
          </div>
        </section>

        {/* VALUE PROPS SECTION */}
        <section id="features" className="bg-gray-50">
          <div className="container py-16 md:py-24">
            <SectionTitle title="Why Choose Finacly AI" />
            
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: <Link className="h-6 w-6 text-blue-600" />,
                  title: "Automated Matching",
                  description: "No spreadsheets. No manual tying out."
                },
                {
                  icon: <Activity className="h-6 w-6 text-blue-600" />,
                  title: "Real-time Processing",
                  description: "Stay reconciled as money moves."
                },
                {
                  icon: <Globe className="h-6 w-6 text-blue-600" />,
                  title: "Multi-Currency Ready",
                  description: "USD, CAD, EUR with conversion + exception flags."
                }
              ].map((item, index) => (
                <Card key={index} variant="elevated" className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF SECTION */}
        <section className="container py-16 md:py-24">
          <SectionTitle 
            title="Built for Accountants & Finance Teams" 
            subtitle="Join the growing community of finance professionals who trust Finacly AI"
          />
          
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Star className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-gray-700 font-medium">Coming soon on QuickBooks App Store</p>
            </Card>
            
            <Card className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-gray-700 font-medium">Stripe Partner Program</p>
            </Card>
            
            <Card className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <CheckCircle2 className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-gray-700 font-medium">SOC 2 compliance in progress</p>
            </Card>
          </div>
          
          {/* Testimonial */}
          <div className="mt-16 max-w-3xl mx-auto">
            <Card className="text-center">
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-gray-700 italic">
                  "Finacly AI has revolutionized our month-end reconciliation process. What used to take days now takes minutes with zero errors."
                </blockquote>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-semibold">Sarah Chen</p>
                <p>CPA, Toronto</p>
              </div>
            </Card>
          </div>
          
          {/* Security callouts */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Encrypted connections</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>OAuth authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Least-privilege access</span>
            </div>
          </div>
        </section>

        {/* PRICING TEASER SECTION */}
        <section id="pricing" className="bg-gray-50">
          <div className="container py-16 md:py-24">
            <SectionTitle 
              title="Simple, Transparent Pricing" 
              subtitle="Beta pricing TBD — join waitlist for founder discount"
            />
            
            <div className="mt-12 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {[
                {
                  name: "Starter",
                  description: "Perfect for small businesses",
                  features: ["Up to 1,000 transactions/month", "Basic reconciliation", "Email support"]
                },
                {
                  name: "Growth",
                  description: "For growing companies",
                  features: ["Up to 10,000 transactions/month", "Advanced matching", "Priority support"],
                  popular: true
                },
                {
                  name: "Scale",
                  description: "Enterprise-grade solution",
                  features: ["Unlimited transactions", "Custom integrations", "Dedicated support"]
                }
              ].map((plan, index) => (
                <Card key={index} variant="elevated" className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    <ul className="space-y-3 mb-8 text-left">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => scrollToSection("waitlist")}
                      variant={plan.popular ? "primary" : "outline"}
                      className="w-full"
                    >
                      Join Waitlist
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* WAITLIST SECTION */}
        <section id="waitlist" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500" />
          <div className="relative container py-16 md:py-20 text-white">
            <SectionTitle
              title="Ready to eliminate reconciliation grunt work?"
              subtitle="Join early access and be the first to experience AI-powered finance ops."
            />
            
            <div className="mt-10 max-w-md mx-auto">
              <WaitlistForm 
                source="hero" 
                placeholder="Enter your email"
                buttonText="Join Waitlist"
              />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}