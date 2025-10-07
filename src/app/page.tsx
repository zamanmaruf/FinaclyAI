import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="bg-green-700 text-white p-4 shadow-md">
        <nav className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">FinaclyAI</h1>
          <div className="space-x-4">
            <Link href="/connect" className="hover:underline">Connect</Link>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/login" className="hover:underline">Login</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-green-600 text-white py-20 text-center">
        <div className="container mx-auto">
          <h2 className="text-5xl font-extrabold mb-4">Your Financial Insights, Simplified.</h2>
          <p className="text-xl mb-8">Integrate, Analyze, Optimize. FinaclyAI brings clarity to your financial data.</p>
          <div className="space-x-4">
            <Link href="/connect" className="bg-white text-green-700 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition duration-300">
              Get Started
            </Link>
            <Link href="/dashboard" className="border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-green-700 transition duration-300">
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-16">
        <h3 className="text-4xl font-bold text-center mb-12">Powerful Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card 1: Stripe */}
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="text-green-500 text-5xl mb-4">💳</div>
            <h4 className="text-2xl font-semibold mb-2">Stripe</h4>
            <p className="text-gray-700">Seamlessly sync your Stripe payments and payouts for comprehensive revenue tracking.</p>
          </div>

          {/* Feature Card 2: Bank Accounts (Plaid) */}
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="text-green-500 text-5xl mb-4">🏦</div>
            <h4 className="text-2xl font-semibold mb-2">Bank Accounts</h4>
            <p className="text-gray-700">Connect to thousands of banks via Plaid to get a unified view of your cash flow.</p>
          </div>

          {/* Feature Card 3: QuickBooks Online */}
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="text-green-500 text-5xl mb-4">📊</div>
            <h4 className="text-2xl font-semibold mb-2">QuickBooks Online</h4>
            <p className="text-gray-700">Automate reconciliation and gain deeper insights into your accounting data.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 text-center">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} FinaclyAI. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <Link href="#" className="hover:underline">Privacy Policy</Link>
            <Link href="#" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
