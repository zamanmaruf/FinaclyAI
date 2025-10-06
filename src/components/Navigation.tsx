"use client";

import { Button } from "./ui/Button";

export function Navigation() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500">
            <span className="text-sm font-bold text-white">F</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Finacly AI</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => scrollToSection("features")}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            How it Works
          </button>
          <button
            onClick={() => scrollToSection("security")}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Security
          </button>
          <button
            onClick={() => scrollToSection("pricing")}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Pricing
          </button>
        </nav>
        
        <Button
          onClick={() => scrollToSection("waitlist")}
          variant="primary"
          size="sm"
          className="hidden sm:inline-flex"
        >
          Join Waitlist
        </Button>
        
        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
