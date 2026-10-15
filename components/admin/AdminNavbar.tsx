'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/I18nProvider';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { UserMenu } from '@/components/layout/UserMenu';

export const AdminNavbar: React.FC = () => {
  const pathname = usePathname();
  const { dict } = useI18n();
  const t = dict.admin;

  // `section` is the URL prefix of the item's sub-pages, e.g. /admin/properties/new
  const navItems = [
    { label: t.nav.properties, href: '/admin', section: '/admin/properties', icon: 'apartment' },
    { label: t.nav.users, href: '/admin/users', section: '/admin/users', icon: 'group' },
  ];

  const isActive = ({ href, section }: (typeof navItems)[number]) =>
    pathname === href || pathname.startsWith(`${section}/`) || pathname === section;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-nordic-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 gap-4">
          <div className="flex items-center self-stretch gap-8 min-w-0">
            <Link href="/admin" className="flex items-center gap-2 group flex-shrink-0">
              <span className="material-symbols-outlined text-mosque text-3xl transition-transform group-hover:scale-105">
                villa
              </span>
              <span className="font-bold text-xl tracking-tight text-nordic">LuxeEstate</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-nordic text-white rounded px-1.5 py-0.5">
                {t.brand}
              </span>
            </Link>

            <div className="hidden md:flex items-stretch self-stretch gap-2">
              {navItems.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex items-center group/nav ${
                      active ? 'text-mosque' : 'text-nordic-dark/60 hover:text-nordic-dark'
                    }`}
                  >
                    <span
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        active ? 'bg-hint-green/60 font-semibold' : 'font-medium group-hover/nav:bg-clear-day'
                      }`}
                    >
                      <span className="material-icons text-lg">{item.icon}</span>
                      {item.label}
                    </span>
                    {/* Bar along the bottom edge of the navbar under the active section */}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-1 bottom-0 h-[3px] rounded-t-full transition-colors ${
                        active ? 'bg-mosque' : 'bg-transparent'
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-nordic-dark/70 hover:text-mosque transition-colors"
            >
              <span className="material-icons text-base">open_in_new</span>
              {t.nav.viewSite}
            </Link>
            <LanguageSwitcher />
            <UserMenu showIdentity />
          </div>
        </div>

        {/* Mobile section tabs */}
        <div className="md:hidden flex gap-2 pb-3 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item) ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                isActive(item)
                  ? 'bg-mosque text-white'
                  : 'text-nordic-dark/70 bg-clear-day'
              }`}
            >
              <span className="material-icons text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
