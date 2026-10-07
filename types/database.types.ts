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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type PropertyRow = Database['public']['Tables']['properties']['Row'];
