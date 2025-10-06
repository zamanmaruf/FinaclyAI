import { Button } from "./ui/Button";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-gray-50 border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500">
                <span className="text-sm font-bold text-white">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Finacly AI</span>
            </div>
            <p className="text-gray-600 mb-6 max-w-md">
              Automated reconciliation for Stripe, banks, and QuickBooks. 
              Built for accountants and finance teams who value accuracy and efficiency.
            </p>
            <Button
              onClick={() => scrollToSection("waitlist")}
              variant="primary"
              size="sm"
            >
              Join Waitlist
            </Button>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  How it Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  Pricing
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/privacy"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@finaclyai.com"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © {currentYear} Finacly AI. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-xs text-gray-500">
              Bank-level security • SOC 2 in progress
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
