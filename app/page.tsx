import Hero from '@/components/Hero'
import ProblemSolution from '@/components/ProblemSolution'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import SignupForm from '@/components/SignupForm'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      
      {/* Final CTA Section */}
      <section id="signup-form" className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/30">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Ready to End the{' '}
            <span className="gradient-text">Reconciliation Nightmare?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join 200+ businesses already signed up for early access. 
            Limited beta spots available.
          </p>
          
          <SignupForm />
        </div>
      </section>
      
      <Footer />
    </main>
  )
}
