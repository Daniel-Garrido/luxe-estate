export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          address: string
          badge: string | null
          badge_type: 'exclusive' | 'new-arrival' | 'sale' | 'rent' | null
          baths: number
          beds: number
          category: 'House' | 'Apartment' | 'Villa' | 'Penthouse'
          city: string
          country: string | null
          created_at: string
          description: string | null
          display_location: string
          formatted_price: string | null
          id: string
          images: string[] | null
          latitude?: number | null
          longitude?: number | null
          is_featured: boolean
          is_published: boolean
          is_active: boolean
          amenities: string[]
          parking: number
          year_built: number | null
          listing_type: 'buy' | 'rent'
          price: number
          price_period: string | null
          slug: string
          sqm: number
          state: string | null
          title: string
        }
        Insert: {
          address: string
          badge?: string | null
          badge_type?: 'exclusive' | 'new-arrival' | 'sale' | 'rent' | null
          baths?: number
          beds?: number
          category: 'House' | 'Apartment' | 'Villa' | 'Penthouse'
          city: string
          country?: string | null
          created_at?: string
          description?: string | null
          display_location: string
          formatted_price?: string | null
          id: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          is_featured?: boolean
          is_published?: boolean
          is_active?: boolean
          amenities?: string[]
          parking?: number
          year_built?: number | null
          listing_type: 'buy' | 'rent'
          price: number
          price_period?: string | null
          slug: string
          sqm?: number
          state?: string | null
          title: string
        }
        Update: {
          address?: string
          badge?: string | null
          badge_type?: 'exclusive' | 'new-arrival' | 'sale' | 'rent' | null
          baths?: number
          beds?: number
          category?: 'House' | 'Apartment' | 'Villa' | 'Penthouse'
          city?: string
          country?: string | null
          created_at?: string
          description?: string | null
          display_location?: string
          formatted_price?: string | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          is_featured?: boolean
          is_published?: boolean
          is_active?: boolean
          amenities?: string[]
          parking?: number
          year_built?: number | null
          listing_type?: 'buy' | 'rent'
          price?: number
          price_period?: string | null
          slug?: string
          sqm?: number
          state?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          provider: string | null
          role: Database['public']['Enums']['user_role']
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          provider?: string | null
          role?: Database['public']['Enums']['user_role']
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          provider?: string | null
          role?: Database['public']['Enums']['user_role']
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'admin' | 'broker' | 'agent' | 'viewer'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type PropertyRow = Database['public']['Tables']['properties']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type UserRole = Database['public']['Enums']['user_role'];
