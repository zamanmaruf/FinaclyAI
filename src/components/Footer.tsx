export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500">
              <span className="text-sm font-bold text-white">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Finacly AI</span>
          </div>
          <p className="text-gray-600 text-sm">
            © 2024 Finacly AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}