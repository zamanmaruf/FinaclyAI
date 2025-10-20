import AnnouncementBar from '@/components/AnnouncementBar'
import Hero from '@/components/Hero'
import ProblemSolution from '@/components/ProblemSolution'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import IntegrationsSection from '@/components/IntegrationsSection'
import AccountantSection from '@/components/AccountantSection'
import SecuritySection from '@/components/SecuritySection'
import PricingSection from '@/components/PricingSection'
import FAQSection from '@/components/FAQSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <AnnouncementBar />
      <Hero />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <IntegrationsSection />
      <AccountantSection />
      <SecuritySection />
      <PricingSection />
      <FAQSection />
      
      {/* Final CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-emerald-950 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            We launch December 1, 2025
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Be among the first to reconcile payouts, deposits, and books the right way. 
            Founding discount ends November 30.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#early-access"
              className="btn-primary text-lg px-8 py-4"
            >
              Get Early Access
            </a>
            <a 
              href="https://calendly.com/finacly-ai-inc/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-lg px-8 py-4"
            >
              Book a 15-min Fit Call
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  )
}
