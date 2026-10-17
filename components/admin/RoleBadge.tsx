import React from 'react';
import type { UserRole } from '@/types/database.types';
import { ROLE_STYLES } from '@/components/admin/roleStyles';

export const RoleBadge: React.FC<{ role: UserRole; label: string }> = ({ role, label }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${ROLE_STYLES[role].badge}`}
  >
    <span className="material-icons text-sm">{ROLE_STYLES[role].icon}</span>
    {label}
  </span>
);
