'use client';

import React, { useState } from 'react';
import { Property } from '@/types/property';

interface MortgageCalculatorModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const MortgageCalculatorModal: React.FC<MortgageCalculatorModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);

  if (!isOpen) return null;

  const price = property.price || 1250000;
  const downPaymentAmount = (price * downPaymentPercent) / 100;
  const loanAmount = price - downPaymentAmount;

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  // Monthly Principal & Interest Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyPayment =
    monthlyRate > 0
      ? (loanAmount *
          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      : loanAmount / numberOfPayments;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nordic-dark/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-mosque/10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close calculator"
          className="absolute top-5 right-5 text-nordic-dark/50 hover:text-nordic-dark transition-colors p-1 rounded-full hover:bg-slate-100 cursor-pointer"
        >
          <span className="material-icons text-xl">close</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-mosque/10 text-mosque rounded-full">
            <span className="material-icons text-xl">calculate</span>
          </div>
          <div>
            <h2 className="text-xl font-light text-nordic-dark">Mortgage Calculator</h2>
            <p className="text-xs text-nordic-muted">{property.title}</p>
          </div>
        </div>

        {/* Calculated Monthly Box */}
        <div className="bg-mosque/5 p-4 rounded-xl border border-mosque/15 text-center mb-6">
          <span className="text-xs uppercase tracking-wider text-nordic-muted font-medium">
            Estimated Monthly Payment
          </span>
          <div className="text-3xl font-light text-mosque mt-1">
            ${Math.round(monthlyPayment).toLocaleString('en-US')}
            <span className="text-sm font-normal text-nordic-muted">/mo</span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 text-sm">
          {/* Property Price */}
          <div>
            <div className="flex justify-between text-xs text-nordic-dark mb-1">
              <span>Home Price</span>
              <span className="font-semibold">${price.toLocaleString('en-US')}</span>
            </div>
          </div>

          {/* Down Payment Slider */}
          <div>
            <div className="flex justify-between text-xs text-nordic-dark mb-1">
              <span>Down Payment ({downPaymentPercent}%)</span>
              <span className="font-semibold text-mosque">
                ${Math.round(downPaymentAmount).toLocaleString('en-US')}
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full accent-mosque cursor-pointer"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between text-xs text-nordic-dark mb-1">
              <span>Interest Rate</span>
              <span className="font-semibold">{interestRate}%</span>
            </div>
            <input
              type="range"
              min={3.0}
              max={10.0}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-mosque cursor-pointer"
            />
          </div>

          {/* Loan Term */}
          <div>
            <span className="block text-xs text-nordic-dark mb-2">Loan Term</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLoanTermYears(30)}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  loanTermYears === 30
                    ? 'border-mosque bg-mosque/10 text-mosque'
                    : 'border-slate-200 text-nordic-muted hover:border-slate-300'
                }`}
              >
                30 Years
              </button>
              <button
                type="button"
                onClick={() => setLoanTermYears(15)}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  loanTermYears === 15
                    ? 'border-mosque bg-mosque/10 text-mosque'
                    : 'border-slate-200 text-nordic-muted hover:border-slate-300'
                }`}
              >
                15 Years
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-6 py-3 bg-mosque hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};
