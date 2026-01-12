/**
 * Reusable Country Select Component
 * Fetches active countries from database dynamically
 * Replaces hardcoded country dropdowns throughout the app
 */

'use client';

import { useState, useEffect } from 'react';

interface Country {
  country_code: string;
  country_name: string;
  rate_gbp: number;
  free_shipping_threshold: number | null;
}

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export default function CountrySelect({
  value,
  onChange,
  className = '',
  required = false,
  disabled = false,
  placeholder,
}: CountrySelectProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await fetch('/api/shipping/countries');
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch countries');
        }

        setCountries(data.countries);
        setError(null);
      } catch (err) {
        console.error('[CountrySelect] Error:', err);
        setError('Failed to load countries');

        // Fallback to essential countries if API fails
        setCountries([
          { country_code: 'GB', country_name: 'United Kingdom', rate_gbp: 0, free_shipping_threshold: 500 },
          { country_code: 'IE', country_name: 'Ireland', rate_gbp: 15, free_shipping_threshold: 500 },
          { country_code: 'FR', country_name: 'France', rate_gbp: 15, free_shipping_threshold: 500 },
          { country_code: 'DE', country_name: 'Germany', rate_gbp: 15, free_shipping_threshold: 500 },
          { country_code: 'ES', country_name: 'Spain', rate_gbp: 20, free_shipping_threshold: 500 },
          { country_code: 'IT', country_name: 'Italy', rate_gbp: 20, free_shipping_threshold: 500 },
          { country_code: 'NL', country_name: 'Netherlands', rate_gbp: 15, free_shipping_threshold: 500 },
          { country_code: 'BE', country_name: 'Belgium', rate_gbp: 15, free_shipping_threshold: 500 },
          { country_code: 'US', country_name: 'United States', rate_gbp: 35, free_shipping_threshold: 750 },
          { country_code: 'CA', country_name: 'Canada', rate_gbp: 30, free_shipping_threshold: 750 },
          { country_code: 'AU', country_name: 'Australia', rate_gbp: 45, free_shipping_threshold: 750 },
          { country_code: 'PL', country_name: 'Poland', rate_gbp: 25, free_shipping_threshold: 500 },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchCountries();
  }, []);

  if (loading) {
    return (
      <select className={className} disabled>
        <option>Loading countries...</option>
      </select>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      required={required}
      disabled={disabled}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {countries.map((country) => (
        <option key={country.country_code} value={country.country_code}>
          {country.country_name}
        </option>
      ))}
    </select>
  );
}
