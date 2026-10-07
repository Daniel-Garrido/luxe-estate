import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { PropertySidebar } from '@/components/property/PropertySidebar';
import { PropertyFeatures } from '@/components/property/PropertyFeatures';
import { getPropertyBySlug, getAllPropertySlugs } from '@/lib/supabase';

interface PropertyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate Dynamic SEO Metadata following Best-practices.md
export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return {
      title: 'Property Not Found | Luxe Estate',
      description: 'The requested luxury property could not be found.',
    };
  }

  const title = `${property.title} | ${property.category} in ${property.location.displayLocation} - Luxe Estate`;
  const description =
    property.description ||
    `Discover ${property.title}, an exclusive ${property.category.toLowerCase()} with ${
      property.specs.beds
    } beds, ${property.specs.baths} baths, and ${property.specs.sqm} m² in ${
      property.location.displayLocation
    }.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: property.images[0],
          width: 1200,
          height: 800,
          alt: property.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [property.images[0]],
    },
  };
}

// Static generation of known slugs
export async function generateStaticParams() {
  const slugs = await getAllPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  // Schema.org JSON-LD Structured Data for Google Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    image: property.images,
    url: `https://luxeestate.com/properties/${property.slug}`,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.location.address,
      addressLocality: property.location.city,
      addressRegion: property.location.state,
      addressCountry: property.location.country || 'US',
    },
    geo: property.coordinates
      ? {
          '@type': 'GeoCoordinates',
          latitude: property.coordinates.lat,
          longitude: property.coordinates.lng,
        }
      : undefined,
    numberOfRooms: property.specs.beds,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.specs.sqm,
      unitCode: 'MTK', // Square Meters
    },
  };

  return (
    <div className="min-h-screen bg-clear-day text-nordic-dark font-display antialiased selection:bg-mosque selection:text-white flex flex-col">
      {/* Schema.org Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-nordic-muted hover:text-mosque transition-colors group cursor-pointer"
          >
            <span className="material-icons text-base transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            <span>Back to all properties</span>
          </Link>

          <span className="text-xs uppercase tracking-wider text-nordic-muted bg-white px-3 py-1 rounded-full border border-slate-200">
            {property.category} • {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>

        {/* 12-Column Responsive Grid matching code.html */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Top Left: Main Photo & Thumbnail Gallery */}
          <div className="lg:col-span-8">
            <PropertyGallery
              images={property.images}
              title={property.title}
              badge={property.badge}
              badgeType={property.badgeType}
              isFeatured={property.isFeatured}
            />
          </div>

          {/* Right Column: Sticky Pricing, Agent & Leaflet Map */}
          <div className="lg:col-span-4 relative">
            <PropertySidebar property={property} />
          </div>

          {/* Bottom Left: Specs, Description, Amenities & Mortgage banner */}
          <div className="lg:col-span-8 lg:row-start-2 -mt-4 lg:-mt-8">
            <PropertyFeatures property={property} />
          </div>
        </div>
      </main>

      {/* Footer matching design */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-mosque text-xl">villa</span>
            <span className="text-sm text-nordic-muted">
              © {new Date().getFullYear()} LuxeEstate Inc. All rights reserved.
            </span>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="text-xs text-nordic-muted hover:text-mosque transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="text-xs text-nordic-muted hover:text-mosque transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="text-xs text-nordic-muted hover:text-mosque transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
