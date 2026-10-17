import React from 'react';

// Building blocks of the add/edit property form (antigraviti/resources/add_edit_property_form)

export const inputClass = (hasError?: boolean) =>
  `w-full px-4 py-2.5 rounded-md border bg-white text-nordic placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all ${
    hasError ? 'border-red-400' : 'border-gray-200'
  }`;

// Compact gray inputs of the "Details" card
export const compactInputClass = (hasError?: boolean) =>
  `w-full text-left px-3 py-2 rounded border bg-gray-50 text-nordic text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-mosque focus:border-mosque transition-all ${
    hasError ? 'border-red-400' : 'border-gray-200'
  }`;

interface FormSectionProps {
  icon: string;
  title: string;
  // Sidebar cards are slightly more compact
  compact?: boolean;
  // Right side of the header, e.g. accepted formats
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  icon,
  title,
  compact = false,
  aside,
  className = '',
  children,
}) => (
  <section className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
    <div
      className={`${
        compact ? 'px-6 py-4' : 'px-8 py-6'
      } border-b border-hint-green/30 flex items-center justify-between gap-3 bg-gradient-to-r from-hint-green/10 to-transparent`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
          <span className="material-icons text-lg">{icon}</span>
        </div>
        <h2 className={`${compact ? 'text-lg' : 'text-xl'} font-bold text-nordic`}>{title}</h2>
      </div>
      {aside}
    </div>
    <div className={compact ? 'p-6' : 'p-8'}>{children}</div>
  </section>
);

interface LabelProps {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({ htmlFor, required, children }) => (
  <label className="block text-sm font-medium text-nordic mb-1.5" htmlFor={htmlFor}>
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

export const FieldError: React.FC<{ id: string; message?: string }> = ({ id, message }) =>
  message ? (
    <p id={id} className="mt-1.5 text-xs text-red-600">
      {message}
    </p>
  ) : null;

interface StepperProps {
  id: string;
  icon: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
  min?: number;
  max?: number;
}

// Bedrooms / bathrooms / parking counter
export const Stepper: React.FC<StepperProps> = ({
  id,
  icon,
  label,
  value,
  onChange,
  decreaseLabel,
  increaseLabel,
  min = 0,
  max = 50,
}) => (
  <div className="flex items-center justify-between">
    <label htmlFor={id} className="text-sm font-medium text-nordic flex items-center gap-2">
      <span className="material-icons text-gray-400 text-sm">{icon}</span> {label}
    </label>
    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
      <button
        type="button"
        aria-label={`${decreaseLabel}: ${label}`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        -
      </button>
      <input
        id={id}
        type="text"
        readOnly
        value={value}
        className="w-10 text-center border-none bg-transparent text-nordic p-0 focus:ring-0 focus:outline-none text-sm font-medium"
      />
      <button
        type="button"
        aria-label={`${increaseLabel}: ${label}`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        +
      </button>
    </div>
  </div>
);
