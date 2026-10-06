'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Property } from '@/types/property';
import { ScheduleVisitModal } from '@/components/property/ScheduleVisitModal';

// Dynamic import with SSR disabled for Leaflet (requires browser DOM / window)
const PropertyMap = dynamic(
  () => import('@/components/property/PropertyMap').then((mod) => mod.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[4/3] rounded-lg bg-slate-100 animate-pulse flex items-center justify-center text-nordic-muted text-xs">
        <span className="material-icons animate-spin mr-2">refresh</span> Loading Map...
      </div>
    ),
  }
);

interface PropertySidebarProps {
  property: Property;
}

export const PropertySidebar: React.FC<PropertySidebarProps> = ({ property }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'visit' | 'contact'>('visit');

  const openScheduleVisit = () => {
    setModalMode('visit');
    setIsModalOpen(true);
  };

  const openContactAgent = () => {
    setModalMode('contact');
    setIsModalOpen(true);
  };

  const agent = property.agent || {
    name: 'Sarah Jenkins',
    title: 'Top Rated Agent',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w',
    phone: '+1 (555) 234-5678',
    email: 'sarah.jenkins@luxeestate.com',
  };

  const latitude = property.coordinates?.lat || 37.4419;
  const longitude = property.coordinates?.lng || -122.143;

  return (
    <>
      <div className="sticky top-28 space-y-6">
        {/* Pricing & Agent Action Card */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-mosque/5">
          {/* Price Header */}
          <div className="mb-4">
            <h1 className="text-4xl font-display font-light text-nordic mb-2">
              {property.formattedPrice}
              {property.pricePeriod && (
                <span className="text-lg font-normal text-nordic-muted">
                  {property.pricePeriod}
                </span>
              )}
            </h1>
            <p className="text-nordic/60 font-medium flex items-center gap-1 text-sm">
              <span className="material-icons text-mosque text-sm">location_on</span>
              {property.location.address || property.location.displayLocation}
            </p>
          </div>

          <div className="h-px bg-slate-100 my-6" />

          {/* Agent Information */}
          <div className="flex items-center gap-4 mb-6">
            <img
              alt={agent.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
              src={agent.image}
            />
            <div>
              <h3 className="font-semibold text-nordic text-sm sm:text-base">
                {agent.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-mosque font-medium">
                <span className="material-icons text-[14px]">star</span>
                <span>{agent.title || 'Top Rated Agent'}</span>
              </div>
            </div>

            {/* Chat & Call Quick Buttons */}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={openContactAgent}
                aria-label="Chat with agent"
                className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-icons text-sm">chat</span>
              </button>
              <a
                href={`tel:${agent.phone || '+15552345678'}`}
                aria-label="Call agent"
                className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-icons text-sm">call</span>
              </a>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={openScheduleVisit}
              className="w-full bg-mosque hover:bg-primary-hover text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span className="material-icons text-xl group-hover:scale-110 transition-transform">
                calendar_today
              </span>
              Schedule Visit
            </button>
            <button
              type="button"
              onClick={openContactAgent}
              className="w-full bg-transparent border border-nordic/10 hover:border-mosque text-nordic/80 hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-icons text-xl">mail_outline</span>
              Contact Agent
            </button>
          </div>
        </div>

        {/* Leaflet Interactive Map Card */}
        <div className="bg-white p-2 rounded-xl shadow-xs border border-mosque/5">
          <PropertyMap
            latitude={latitude}
            longitude={longitude}
            title={property.title}
            address={property.location.address}
            displayLocation={property.location.displayLocation}
          />
        </div>
      </div>

      {/* Schedule / Contact Modal */}
      <ScheduleVisitModal
        property={property}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultMode={modalMode}
      />
    </>
  );
};
