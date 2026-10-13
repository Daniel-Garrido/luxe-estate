'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { locales, localeNames, Locale } from '@/i18n/config';
import { setLocale } from '@/i18n/actions';
import { useI18n } from '@/i18n/I18nProvider';

export const LanguageSwitcher: React.FC = () => {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (next: Locale) => {
    setIsOpen(false);
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={dict.language.label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={isPending}
        className="flex items-center gap-1 text-sm font-medium text-nordic-dark hover:text-mosque transition-colors cursor-pointer disabled:opacity-60"
      >
        <span className={`material-icons text-xl ${isPending ? 'animate-spin' : ''}`}>
          {isPending ? 'autorenew' : 'language'}
        </span>
        <span className="uppercase">{locale}</span>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label={dict.language.label}
          className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-soft border border-nordic-dark/10 py-1 z-50"
        >
          {locales.map((code) => {
            const isActive = code === locale;
            return (
              <li key={code} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  lang={code}
                  onClick={() => handleSelect(code)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors cursor-pointer ${
                    isActive
                      ? 'text-mosque font-semibold bg-mosque/5'
                      : 'text-nordic-dark hover:bg-hint-green/30'
                  }`}
                >
                  {localeNames[code]}
                  {isActive && <span className="material-icons text-base">check</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
