'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Plus } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  
  // Don't show header on timer page (fullscreen zen mode)
  if (pathname?.includes('/session/active')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50 transition-shadow">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
          <span className="font-semibold text-xl tracking-tight">Stride</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              pathname === '/dashboard' 
                ? 'text-teal-600' 
                : 'text-gray-600 hover:text-teal-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          
          <Link 
            href="/session/start"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full text-sm font-medium hover:shadow-lg hover:shadow-teal-500/30 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            New Session
          </Link>
        </nav>
      </div>
    </header>
  );
}