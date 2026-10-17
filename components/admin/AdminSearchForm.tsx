import React from 'react';
import Link from 'next/link';

interface AdminSearchFormProps {
  // Page the form submits to with ?q=
  action: string;
  defaultValue?: string;
  placeholder: string;
  submitLabel: string;
  clearLabel: string;
  // Extra params to keep while searching, e.g. the active role tab
  hiddenParams?: Record<string, string | undefined>;
}

// Plain GET form: the search lives in the URL and works without JavaScript
export const AdminSearchForm: React.FC<AdminSearchFormProps> = ({
  action,
  defaultValue = '',
  placeholder,
  submitLabel,
  clearLabel,
  hiddenParams = {},
}) => (
  <form action={action} method="get" role="search" className="relative w-full md:w-80">
    {Object.entries(hiddenParams).map(([name, value]) =>
      value ? <input key={name} type="hidden" name={name} value={value} /> : null
    )}
    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-nordic-muted text-xl pointer-events-none">
      search
    </span>
    <input
      type="search"
      name="q"
      defaultValue={defaultValue}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full h-11 pl-10 pr-10 rounded-xl bg-white border border-nordic-dark/10 text-sm text-nordic placeholder:text-nordic-muted/70 focus:outline-none focus:ring-2 focus:ring-mosque/30 focus:border-mosque shadow-card"
    />
    {defaultValue && (
      <Link
        href={action}
        aria-label={clearLabel}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-nordic-muted hover:text-nordic"
      >
        <span className="material-icons text-lg">close</span>
      </Link>
    )}
    <button type="submit" className="sr-only">
      {submitLabel}
    </button>
  </form>
);
