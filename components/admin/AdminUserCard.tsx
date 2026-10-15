import React from 'react';
import type { ProfileRow } from '@/types/database.types';
import type { Dictionary } from '@/i18n/dictionaries';
import type { Locale } from '@/i18n/config';
import { RoleBadge } from '@/components/admin/RoleBadge';
import { RoleSelect } from '@/components/admin/RoleSelect';

interface AdminUserCardProps {
  profile: ProfileRow;
  isCurrentUser: boolean;
  dict: Dictionary;
  locale: Locale;
}

export const AdminUserCard: React.FC<AdminUserCardProps> = ({
  profile,
  isCurrentUser,
  dict,
  locale,
}) => {
  const t = dict.admin.users;
  const name = profile.full_name || profile.email || '—';
  const initial = name.trim().charAt(0).toUpperCase();
  const joined = new Date(profile.created_at).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <li
      className={`grid grid-cols-1 md:grid-cols-[2fr_1fr_1.2fr_auto] items-center gap-4 rounded-2xl p-5 border shadow-card ${
        isCurrentUser ? 'bg-hint-green/60 border-hint-green' : 'bg-white border-nordic-dark/5'
      }`}
    >
      {/* User details */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 flex-shrink-0 rounded-full bg-mosque overflow-hidden flex items-center justify-center text-white font-semibold">
          {profile.avatar_url ? (
            // Plain <img>: avatar hosts vary per provider and are already sized
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          ) : (
            initial
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-nordic truncate">
            {name}
            {isCurrentUser && (
              <span className="ml-2 text-xs font-medium text-mosque">({t.you})</span>
            )}
          </p>
          {profile.email && <p className="text-sm text-nordic-muted truncate">{profile.email}</p>}
          <p className="mt-1 inline-block text-[11px] text-nordic-muted bg-clear-day rounded px-1.5 py-0.5 font-mono">
            ID: {profile.id.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* Role */}
      <div>
        <RoleBadge role={profile.role} label={dict.admin.roles[profile.role]} />
      </div>

      {/* Details */}
      <div className="flex gap-8 text-sm">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-nordic-muted">{t.provider}</p>
          <p className="font-semibold text-nordic capitalize">{profile.provider || '—'}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-nordic-muted">{t.joined}</p>
          <p className="font-semibold text-nordic">{joined}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="md:justify-self-end">
        <RoleSelect userId={profile.id} currentRole={profile.role} disabled={isCurrentUser} />
      </div>
    </li>
  );
};
