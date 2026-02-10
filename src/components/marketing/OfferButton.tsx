/**
 * Offer Button
 * Simple button component that triggers Smart Offer Modal
 * Can be used anywhere on the site
 */

'use client';

import { useState } from 'react';
import SmartOfferModal from './SmartOfferModal';

interface OfferButtonProps {
  // Button appearance
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;

  // Pre-fill context
  suggestedMachineId?: string;
  suggestedProblem?: string;
  source?: 'website' | 'email' | 'admin' | 'sales_rep';

  // Callbacks
  onOfferRequested?: (data: { offer_intent_id: string; offer_url: string }) => void;
}

export default function OfferButton({
  variant = 'primary',
  size = 'md',
  children = 'Get My Offer',
  className = '',
  suggestedMachineId,
  suggestedProblem,
  source = 'website',
  onOfferRequested,
}: OfferButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Button styles
  const baseStyles = 'font-bold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700 focus:ring-blue-500 shadow-lg',
    secondary: 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    text: 'text-blue-600 hover:text-blue-800 underline',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const buttonClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={buttonClassName}
        type="button"
      >
        {children}
      </button>

      <SmartOfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        suggestedMachineId={suggestedMachineId}
        suggestedProblem={suggestedProblem}
        source={source}
        sourceUrl={typeof window !== 'undefined' ? window.location.href : undefined}
        onSuccess={(data) => {
          if (onOfferRequested) {
            onOfferRequested(data);
          }
        }}
      />
    </>
  );
}
