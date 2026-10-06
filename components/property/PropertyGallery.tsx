'use client';

import React, { useState } from 'react';

interface PropertyGalleryProps {
  images: string[];
  title: string;
  badge?: string;
  badgeType?: 'exclusive' | 'new-arrival' | 'sale' | 'rent';
  isFeatured?: boolean;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({
  images,
  title,
  badge,
  badgeType,
  isFeatured,
}) => {
  const galleryImages = images && images.length > 0 ? images : ['/images/placeholder.jpg'];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activeImage = galleryImages[selectedIndex] || galleryImages[0];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Hero Image */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm group bg-gray-100">
          <img
            alt={`${title} - Photo ${selectedIndex + 1}`}
            src={activeImage}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Badges on Top Left */}
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            {isFeatured && (
              <span className="bg-mosque text-white text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                Featured
              </span>
            )}
            {badge && (
              <span className="bg-white/90 backdrop-blur-sm text-nordic text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                {badge}
              </span>
            )}
            {!isFeatured && !badge && (
              <span className="bg-mosque text-white text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                Premium
              </span>
            )}
          </div>

          {/* Navigation Arrows on Hover (desktop) */}
          {galleryImages.length > 1 && (
            <div className="absolute inset-y-0 inset-x-4 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous photo"
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-nordic shadow-md flex items-center justify-center pointer-events-auto transition-transform hover:scale-110 cursor-pointer"
              >
                <span className="material-icons text-xl">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next photo"
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-nordic shadow-md flex items-center justify-center pointer-events-auto transition-transform hover:scale-110 cursor-pointer"
              >
                <span className="material-icons text-xl">chevron_right</span>
              </button>
            </div>
          )}

          {/* View All Photos Button */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-nordic px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur-sm transition-all flex items-center gap-2 cursor-pointer z-10 hover:shadow-xl"
          >
            <span className="material-icons text-sm">grid_view</span>
            View All Photos ({galleryImages.length})
          </button>
        </div>

        {/* Thumbnail Carousel */}
        {galleryImages.length > 1 && (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x">
            {galleryImages.map((img, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`flex-none w-48 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer transition-all snap-start ${
                    isSelected
                      ? 'ring-2 ring-mosque ring-offset-2 ring-offset-clear-day opacity-100 shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    alt={`Thumbnail ${idx + 1}`}
                    src={img}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Full-Screen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8 backdrop-blur-md animate-in fade-in duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between text-white pb-4 border-b border-white/10">
            <div>
              <h3 className="font-medium text-lg text-white">{title}</h3>
              <p className="text-white/60 text-sm">
                Photo {selectedIndex + 1} of {galleryImages.length}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close photo gallery"
            >
              <span className="material-icons">close</span>
            </button>
          </div>

          {/* Main Photo Area */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              alt={`${title} - Photo ${selectedIndex + 1}`}
              src={activeImage}
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300"
            />

            {/* Left / Right Nav in Lightbox */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-6 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer hover:scale-105"
                  aria-label="Previous image"
                >
                  <span className="material-icons text-2xl">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-6 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer hover:scale-105"
                  aria-label="Next image"
                >
                  <span className="material-icons text-2xl">chevron_right</span>
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails in Lightbox */}
          <div className="flex gap-3 overflow-x-auto justify-center py-2 max-w-4xl mx-auto scrollbar-hide">
            {galleryImages.map((img, idx) => (
              <button
                key={`lb-${img}-${idx}`}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`flex-none w-20 h-14 rounded-md overflow-hidden transition-all ${
                  idx === selectedIndex
                    ? 'ring-2 ring-mosque scale-105 opacity-100'
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                <img
                  alt={`Thumbnail ${idx + 1}`}
                  src={img}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
