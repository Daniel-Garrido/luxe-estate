import React from 'react';

interface AdminPageHeaderProps {
  title: string;
  subtitle: string;
  // Right-hand actions, e.g. the search form and the add button
  children?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ title, subtitle, children }) => (
  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-nordic">{title}</h1>
      <p className="mt-2 text-nordic-muted">{subtitle}</p>
    </div>
    {children && (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">{children}</div>
    )}
  </div>
);
