import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  // Tailwind classes for the icon bubble
  tone?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  tone = 'bg-clear-day text-mosque',
}) => (
  <div className="bg-white rounded-2xl border border-nordic-dark/5 shadow-card p-6 flex items-start justify-between">
    <div>
      <p className="text-sm text-nordic-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold text-nordic">{value.toLocaleString()}</p>
    </div>
    <span className={`w-12 h-12 rounded-full flex items-center justify-center ${tone}`}>
      <span className="material-icons">{icon}</span>
    </span>
  </div>
);
