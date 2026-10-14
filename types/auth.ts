export type OAuthProvider = 'google' | 'github';

// Serializable subset of the Supabase user that the UI needs
export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  provider: string | null;
}
