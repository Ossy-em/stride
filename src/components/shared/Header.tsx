'use client';

import { User, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { Wordmark } from '@/components/ui/wordmark';

interface HeaderProps {
  showNav?: boolean;
}

export default function Header({ showNav = true }: HeaderProps) {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white border-b border-[#eef1ed]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <Wordmark size="md" />
          </Link>

          {/* Navigation */}
          {showNav && (
            <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-[#48645b] hover:text-[#10221c] transition-colors"
              >
                Home
              </Link>
              <Link
                href="/patterns"
                className="text-sm font-medium text-[#48645b] hover:text-[#10221c] transition-colors"
              >
                Patterns
              </Link>
            </nav>
          )}

          {/* User Menu */}
          {session?.user && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-[#eef1ed] transition-colors"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#eef1ed] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#7c9389]" />
                  </div>
                )}
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDropdown(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#e6ebe8] py-2 z-20">
                    <div className="px-4 py-2 border-b border-[#eef1ed]">
                      <p className="text-sm font-medium text-[#10221c] truncate">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-[#7c9389] truncate">
                        {session.user.email}
                      </p>
                    </div>

                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#48645b] hover:bg-[#f4f7f2] transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}