'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ListingType } from '@/types/property';

interface NavbarProps {
  activeListingType?: ListingType;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeListingType = 'buy',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getHref = (item: string) => {
    switch (item) {
      case 'Buy':
        return '/?type=buy';
      case 'Rent':
        return '/?type=rent';
      case 'All':
        return '/';
      default:
        return '/';
    }
  };

  const isItemActive = (item: string) => {
    if (item === 'Buy' && activeListingType === 'buy') return true;
    if (item === 'Rent' && activeListingType === 'rent') return true;
    if (item === 'All' && activeListingType === 'all') return true;
    return false;
  };

  const navItems = [
    { label: 'Buy', href: '/?type=buy' },
    { label: 'Rent', href: '/?type=rent' },
    { label: 'All Homes', href: '/' },
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
              const active =
                (item.label === 'Buy' && activeListingType === 'buy') ||
                (item.label === 'Rent' && activeListingType === 'rent') ||
                (item.label === 'All Homes' && activeListingType === 'all');

              return (
                <Link
                  key={item.label}
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
            <Link
              href="/#properties-grid"
              aria-label="Search"
              className="text-nordic-dark hover:text-mosque transition-colors cursor-pointer"
            >
              <span className="material-icons">search</span>
            </Link>
            <button
              type="button"
              aria-label="Notifications"
              className="text-nordic-dark hover:text-mosque transition-colors relative cursor-pointer"
            >
              <span className="material-icons">notifications_none</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-mosque rounded-full border-2 border-clear-day" />
            </button>
            <button
              type="button"
              aria-label="Profile"
              className="flex items-center gap-2 pl-2 border-l border-nordic-dark/10 ml-2 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-mosque transition-all">
                <img
                  alt="Profile"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAWhQZ663Bd08kmzjbOPmUk4UIxYooNONShMEFXLR-DtmVi6Oz-TiaY77SPwFk7g0OobkeZEOMvt6v29mSOD0Xm2g95WbBG3ZjWXmiABOUwGU0LOySRfVDo-JTXQ0-gtwjWxbmue0qDm91m-zEOEZwAW6iRFB1qC1bAU-wkjxm67Sbztq8w7srHkFT9bVEC86qG-FzhOBTomhAurNRmx9l8Yfqabk328NfdKuVLckgCdaPsNFE3yN65MeoRi05GA_gXIMwG4YDIeA"
                />
              </div>
            </button>

            {/* Mobile menu hamburger toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-nordic-dark hover:text-mosque p-1"
              aria-label="Toggle menu"
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
              key={item.label}
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
