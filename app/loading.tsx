import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-clear-day text-nordic-dark font-display antialiased">
      {/* Top subtle indeterminate progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-mosque/20 overflow-hidden z-50">
        <div className="h-full bg-mosque animate-pulse w-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="h-10 w-64 bg-nordic-dark/5 rounded-lg mb-8 animate-pulse"></div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden shadow-card animate-pulse"
            >
              <div className="aspect-[4/3] bg-nordic-dark/10"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 w-1/3 bg-nordic-dark/10 rounded"></div>
                <div className="h-4 w-3/4 bg-nordic-dark/10 rounded"></div>
                <div className="h-3 w-1/2 bg-nordic-dark/10 rounded"></div>
                <div className="pt-3 border-t border-gray-100 flex justify-between">
                  <div className="h-3 w-12 bg-nordic-dark/10 rounded"></div>
                  <div className="h-3 w-12 bg-nordic-dark/10 rounded"></div>
                  <div className="h-3 w-12 bg-nordic-dark/10 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
