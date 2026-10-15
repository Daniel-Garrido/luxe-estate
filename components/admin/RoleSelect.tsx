'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import type { UserRole } from '@/types/database.types';
import { USER_ROLES } from '@/lib/auth/roles';
import { updateUserRole } from '@/app/admin/users/actions';
import { useI18n } from '@/i18n/I18nProvider';
import { ROLE_STYLES } from '@/components/admin/roleStyles';

interface RoleSelectProps {
  userId: string;
  currentRole: UserRole;
  // The signed-in admin cannot change their own role
  disabled?: boolean;
}

export const RoleSelect: React.FC<RoleSelectProps> = ({ userId, currentRole, disabled }) => {
  const { dict } = useI18n();
  const t = dict.admin;
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside or pressing Escape
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

  const handleSelect = (role: UserRole) => {
    setIsOpen(false);
    if (role === currentRole) return;
    setError(null);
    startTransition(async () => {
      // The action revalidates /admin/users, so the new role shows up on its own
      const result = await updateUserRole(userId, role);
      if (!result.ok) setError(t.users.errors[result.error]);
    });
  };

  return (
    <div ref={containerRef} className="relative inline-flex flex-col items-end">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isPending}
        title={disabled ? t.users.cannotChangeOwn : undefined}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
          isOpen
            ? 'bg-mosque text-white border-mosque'
            : 'bg-white text-nordic border-nordic-dark/10 hover:border-mosque hover:text-mosque'
        }`}
      >
        {isPending ? t.users.saving : t.users.changeRole}
        <span className="material-icons text-base">{isOpen ? 'expand_less' : 'expand_more'}</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 bg-mosque rounded-xl shadow-soft py-2 z-30"
        >
          {USER_ROLES.map((role) => (
            <button
              key={role}
              type="button"
              role="menuitemradio"
              aria-checked={role === currentRole}
              onClick={() => handleSelect(role)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white text-left transition-colors cursor-pointer ${
                role === currentRole ? 'bg-white/15 font-semibold' : 'hover:bg-white/10'
              }`}
            >
              <span className="material-icons text-base opacity-80">{ROLE_STYLES[role].icon}</span>
              <span className="flex-1">{t.roles[role]}</span>
              {role === currentRole && <span className="material-icons text-base">check</span>}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-600 max-w-52 text-right">
          {error}
        </p>
      )}
    </div>
  );
};
