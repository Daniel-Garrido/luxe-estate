'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { signOut } from '@/app/auth/actions';
import { useI18n } from '@/i18n/I18nProvider';
import { ADMIN_PATH, canAccessAdmin } from '@/lib/auth/roles';

export const UserMenu: React.FC = () => {
  const user = useAuth();
  const { dict } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
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

  if (!user) {
    const loginHref = pathname && pathname !== '/' ? `/login?next=${encodeURIComponent(pathname)}` : '/login';
    return (
      <Link
        href={loginHref}
        className="flex items-center gap-1.5 pl-4 border-l border-nordic-dark/10 ml-2 text-sm font-medium text-nordic-dark hover:text-mosque transition-colors"
      >
        <span className="material-icons text-xl">account_circle</span>
        <span className="hidden sm:inline">{dict.nav.login}</span>
      </Link>
    );
  }

  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase();
  const showAvatar = user.avatarUrl && !avatarFailed;

  const handleSignOut = () => {
    setIsOpen(false);
    startTransition(async () => {
      await signOut();
      router.refresh();
    });
  };

  return (
    <div ref={containerRef} className="relative pl-2 border-l border-nordic-dark/10 ml-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={dict.nav.account}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        disabled={isPending}
        className="flex items-center gap-2 cursor-pointer disabled:opacity-60"
      >
        <div className="w-9 h-9 rounded-full bg-mosque overflow-hidden ring-2 ring-transparent hover:ring-mosque transition-all flex items-center justify-center text-white text-sm font-semibold">
          {showAvatar ? (
            // Plain <img>: avatar hosts vary per provider and are already sized
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={user.name || dict.nav.profile}
              className="w-full h-full object-cover"
              src={user.avatarUrl!}
              referrerPolicy="no-referrer"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            initial
          )}
        </div>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-soft border border-nordic-dark/10 py-2 z-50"
        >
          <div className="px-4 py-2 border-b border-nordic-dark/10 mb-1">
            {user.name && (
              <p className="text-sm font-semibold text-nordic-dark truncate">{user.name}</p>
            )}
            {user.email && (
              <p className="text-xs text-nordic-dark/60 truncate">{user.email}</p>
            )}
          </div>
          {canAccessAdmin(user.role) && (
            <Link
              href={ADMIN_PATH}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-nordic-dark hover:bg-hint-green/30 transition-colors"
            >
              <span className="material-icons text-base">dashboard</span>
              {dict.nav.admin}
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-nordic-dark hover:bg-hint-green/30 transition-colors cursor-pointer"
          >
            <span className="material-icons text-base">logout</span>
            {dict.nav.logout}
          </button>
        </div>
      )}
    </div>
  );
};
