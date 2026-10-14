'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ListingType } from '@/types/property';
import { useI18n } from '@/i18n/I18nProvider';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { UserMenu } from '@/components/layout/UserMenu';

interface NavbarProps {
  activeListingType?: ListingType;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeListingType = 'buy',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { dict } = useI18n();

  const navItems: { label: string; href: string; type: ListingType }[] = [
    { label: dict.nav.buy, href: '/?type=buy', type: 'buy' },
    { label: dict.nav.rent, href: '/?type=rent', type: 'rent' },
    { label: dict.nav.allHomes, href: '/', type: 'all' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-clear-day/95 backdrop-blur-md border-b border-nordic-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo - Returns to home on click */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
            <span className="material-symbols-outlined text-mosque text-3xl font-bold transition-transform group-hover:scale-105">
              villa
            </span>
            <span className="font-bold text-xl tracking-tight text-nordic group-hover:text-mosque transition-colors">
              LuxeEstate
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const active = item.type === activeListingType;

              return (
                <Link
                  key={item.type}
                  href={item.href}
                  className={`font-medium text-sm px-1 py-1 transition-all cursor-pointer ${
                    active
                      ? 'text-mosque border-b-2 border-mosque font-semibold'
                      : 'text-nordic-dark/70 hover:text-nordic-dark hover:border-b-2 hover:border-nordic-dark/20'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center space-x-6">
            <LanguageSwitcher />
            <Link
              href="/#properties-grid"
              aria-label={dict.nav.search}
              className="text-nordic-dark hover:text-mosque transition-colors cursor-pointer"
            >
              <span className="material-icons">search</span>
            </Link>
            <button
              type="button"
              aria-label={dict.nav.notifications}
              className="text-nordic-dark hover:text-mosque transition-colors relative cursor-pointer"
            >
              <span className="material-icons">notifications_none</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-mosque rounded-full border-2 border-clear-day" />
            </button>
            <UserMenu />

            {/* Mobile menu hamburger toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-nordic-dark hover:text-mosque p-1"
              aria-label={dict.nav.toggleMenu}
            >
              <span className="material-icons">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-nordic-dark/10 bg-clear-day px-4 pt-3 pb-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.type}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-nordic-dark hover:bg-hint-green/30"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};
