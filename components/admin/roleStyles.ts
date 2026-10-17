import type { UserRole } from '@/types/database.types';

// Shared look for each role in badges and the role picker
export const ROLE_STYLES: Record<UserRole, { icon: string; badge: string }> = {
  admin: { icon: 'shield', badge: 'bg-nordic text-white' },
  broker: { icon: 'business_center', badge: 'bg-hint-green text-mosque' },
  agent: { icon: 'support_agent', badge: 'bg-clear-day text-nordic border border-nordic-dark/10' },
  viewer: { icon: 'visibility', badge: 'bg-gray-100 text-nordic-muted' },
};
