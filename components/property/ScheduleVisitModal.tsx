'use client';

import React, { useState } from 'react';
import { Property } from '@/types/property';

interface ScheduleVisitModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'visit' | 'contact';
}

export const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({
  property,
  isOpen,
  onClose,
  defaultMode = 'visit',
}) => {
  const [mode, setMode] = useState<'visit' | 'contact'>(defaultMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: 'morning',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2500);
  };

  const whatsappMessage = encodeURIComponent(
    `Hola, me interesa agendar una visita para la propiedad: ${property.title} (Ref: ${property.id}). ¿Podrían brindarme más información?`
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nordic-dark/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-mosque/10 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 text-nordic-dark/50 hover:text-nordic-dark transition-colors p-1 rounded-full hover:bg-slate-100 cursor-pointer"
        >
          <span className="material-icons text-xl">close</span>
        </button>

        {isSubmitted ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 bg-hint-green rounded-full flex items-center justify-center mx-auto text-mosque">
              <span className="material-icons text-3xl">check_circle</span>
            </div>
            <h3 className="text-2xl font-light text-nordic-dark">Request Received</h3>
            <p className="text-nordic-muted text-sm max-w-sm mx-auto">
              Our private client broker for <strong>{property.title}</strong> will contact you shortly to confirm your appointment.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setMode('visit')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    mode === 'visit'
                      ? 'bg-mosque text-white'
                      : 'bg-slate-100 text-nordic-muted hover:text-nordic-dark'
                  }`}
                >
                  Schedule Private Visit
                </button>
                <button
                  type="button"
                  onClick={() => setMode('contact')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    mode === 'contact'
                      ? 'bg-mosque text-white'
                      : 'bg-slate-100 text-nordic-muted hover:text-nordic-dark'
                  }`}
                >
                  Contact Broker
                </button>
              </div>
              <h2 className="text-2xl font-light text-nordic-dark">
                {mode === 'visit' ? 'Book a Private Showing' : 'Inquire About Property'}
              </h2>
              <p className="text-xs text-nordic-muted mt-1">
                {property.title} — {property.formattedPrice}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-nordic-dark mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexander Vance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm focus:outline-hidden focus:border-mosque focus:ring-1 focus:ring-mosque"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-nordic-dark mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm focus:outline-hidden focus:border-mosque focus:ring-1 focus:ring-mosque"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-nordic-dark mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm focus:outline-hidden focus:border-mosque focus:ring-1 focus:ring-mosque"
                  />
                </div>
              </div>

              {mode === 'visit' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-nordic-dark mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm focus:outline-hidden focus:border-mosque focus:ring-1 focus:ring-mosque"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-nordic-dark mb-1">
                      Time of Day
                    </label>
                    <select
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm focus:outline-hidden focus:border-mosque focus:ring-1 focus:ring-mosque bg-white"
                    >
                      <option value="morning">Morning (9am - 12pm)</option>
                      <option value="afternoon">Afternoon (1pm - 5pm)</option>
                      <option value="evening">Sunset Tour (5pm - 7pm)</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-nordic-dark mb-1">
                  Message or Special Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="I'm interested in viewing this property..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-nordic-dark/15 text-sm focus:outline-hidden focus:border-mosque focus:ring-1 focus:ring-mosque"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-mosque hover:bg-primary-hover text-white py-3.5 px-6 rounded-lg font-medium text-sm transition-all shadow-md shadow-mosque/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span className="material-icons text-lg">
                  {mode === 'visit' ? 'calendar_today' : 'send'}
                </span>
                {mode === 'visit' ? 'Request Appointment' : 'Send Message'}
              </button>

              {/* Direct WhatsApp Option */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-center">
                <a
                  href={`https://wa.me/15552345678?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-medium text-mosque hover:opacity-80 transition-opacity"
                >
                  <span className="material-icons text-sm">chat</span>
                  Or chat directly via WhatsApp
                </a>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
