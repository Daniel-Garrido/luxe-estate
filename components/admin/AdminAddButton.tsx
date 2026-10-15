import React from 'react';
import Link from 'next/link';

interface AdminAddButtonProps {
  href: string;
  label: string;
}

// Primary "add" action shared by every admin section, so they all look the same
export const AdminAddButton: React.FC<AdminAddButtonProps> = ({ href, label }) => (
  <Link
    href={href}
    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-mosque text-white text-sm font-medium whitespace-nowrap shadow-md shadow-mosque/20 hover:bg-mosque/90 hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-mosque/40 focus-visible:ring-offset-2"
  >
    <span className="material-icons text-lg">add</span>
    {label}
  </Link>
);
