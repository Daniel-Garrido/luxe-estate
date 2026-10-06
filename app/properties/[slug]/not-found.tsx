import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

export default function PropertyNotFound() {
  return (
    <div className="min-h-screen bg-clear-day text-nordic-dark font-display antialiased flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-mosque/10 text-mosque flex items-center justify-center mb-6">
          <span className="material-icons text-4xl">home_work</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-light text-nordic-dark mb-3">
          Property Not Found
        </h1>

        <p className="text-nordic-muted max-w-md text-sm sm:text-base mb-8">
          The luxury property you are looking for may have been sold, leased, or is no longer publicly listed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-mosque hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors shadow-md shadow-mosque/20 flex items-center gap-2 cursor-pointer"
          >
            <span className="material-icons text-lg">arrow_back</span>
            Return to All Homes
          </Link>
          <Link
            href="/?type=buy"
            className="px-6 py-3 bg-white border border-slate-200 hover:border-mosque text-nordic-dark hover:text-mosque rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Explore Available Listings
          </Link>
        </div>
      </main>
    </div>
  );
}
