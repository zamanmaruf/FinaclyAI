import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500">
                <span className="text-sm font-bold text-white">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">FinaclyAI</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Automated financial reconciliation for Stripe, banks & QuickBooks.
              Save hours of manual data entry every month.
            </p>
            <p className="text-gray-500 text-xs">
              <strong>Compliance Commitment:</strong> SOC 2 roadmap in progress.
              GDPR-ready with DPAs available. PIPEDA compliant.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/connect" className="text-gray-600 hover:text-gray-900">
                  Connect Services
                </Link>
              </li>
              <li>
                <a href="https://github.com/zamanmaruf/FinaclyAI" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="mailto:legal@finaclyai.com" className="text-gray-600 hover:text-gray-900">
                  DPA Request
                </a>
              </li>
              <li>
                <a href="mailto:security@finaclyai.com" className="text-gray-600 hover:text-gray-900">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 text-sm">
              © 2025 FinaclyAI. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-medium">
                BETA
              </span>
              <span>Status: Production Ready</span>
              <span>•</span>
              <a href="mailto:support@finaclyai.com" className="hover:text-gray-900">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}