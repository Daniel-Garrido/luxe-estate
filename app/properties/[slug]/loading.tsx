import React from 'react';

export default function PropertyDetailLoading() {
  return (
    <div className="min-h-screen bg-clear-day text-nordic-dark font-display antialiased flex flex-col animate-pulse">
      {/* Navbar Placeholder */}
      <div className="h-20 bg-clear-day border-b border-nordic-dark/10" />

      {/* Main Content Area Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Back Link Skeleton */}
        <div className="h-4 w-40 bg-slate-200 rounded-md mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Gallery Skeleton */}
          <div className="lg:col-span-8 space-y-4">
            <div className="aspect-[16/10] bg-slate-200 rounded-xl" />
            <div className="flex gap-4 overflow-hidden">
              <div className="w-48 aspect-[4/3] bg-slate-200 rounded-lg flex-none" />
              <div className="w-48 aspect-[4/3] bg-slate-200 rounded-lg flex-none" />
              <div className="w-48 aspect-[4/3] bg-slate-200 rounded-lg flex-none" />
            </div>
          </div>

          {/* Sticky Sidebar Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-100 space-y-4">
              <div className="h-9 w-48 bg-slate-200 rounded-md" />
              <div className="h-4 w-60 bg-slate-200 rounded-md" />
              <div className="h-px bg-slate-100 my-4" />
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-200 rounded-full flex-none" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-28 bg-slate-200 rounded-md" />
                  <div className="h-3 w-20 bg-slate-200 rounded-md" />
                </div>
              </div>
              <div className="h-12 w-full bg-slate-200 rounded-lg mt-4" />
              <div className="h-12 w-full bg-slate-200 rounded-lg" />
            </div>

            <div className="bg-white p-2 rounded-xl border border-slate-100">
              <div className="aspect-[4/3] bg-slate-200 rounded-lg" />
            </div>
          </div>

          {/* Features Skeleton */}
          <div className="lg:col-span-8 lg:row-start-2 -mt-4 lg:-mt-8 space-y-8">
            <div className="bg-white p-8 rounded-xl border border-slate-100 space-y-4">
              <div className="h-5 w-40 bg-slate-200 rounded-md mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="h-24 bg-slate-100 rounded-lg" />
                <div className="h-24 bg-slate-100 rounded-lg" />
                <div className="h-24 bg-slate-100 rounded-lg" />
                <div className="h-24 bg-slate-100 rounded-lg" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-100 space-y-3">
              <div className="h-5 w-44 bg-slate-200 rounded-md mb-4" />
              <div className="h-4 w-full bg-slate-200 rounded-md" />
              <div className="h-4 w-5/6 bg-slate-200 rounded-md" />
              <div className="h-4 w-4/6 bg-slate-200 rounded-md" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
