export type PropertyCategory = 'All' | 'House' | 'Apartment' | 'Villa' | 'Penthouse';

export type ListingType = 'all' | 'buy' | 'rent';

export interface PropertyLocation {
  address: string;
  city: string;
  state?: string;
  country?: string;
  displayLocation: string;
}

export interface PropertySpecs {
  beds: number;
  baths: number;
  sqm: number;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  formattedPrice: string;
  pricePeriod?: string; // e.g., '/mo' for rentals
  category: Exclude<PropertyCategory, 'All'>;
  listingType: 'buy' | 'rent';
  location: PropertyLocation;
  specs: PropertySpecs;
  image: string;
  imageAlt: string;
  images: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  garage?: number;
  amenities?: string[];
  agent?: {
    name: string;
    title: string;
    image: string;
    phone?: string;
    email?: string;
    rating?: number;
  };
  badge?: string;
  badgeType?: 'exclusive' | 'new-arrival' | 'sale' | 'rent';
  isFeatured?: boolean;
  isSaved?: boolean;
  createdAt?: string;
}

export interface PropertyFilterOptions {
  category?: PropertyCategory;
  listingType?: ListingType;
  searchQuery?: string;
}
