/**
 * Reorder Tab - Company-specific reorder reminders
 */

'use client';

import { useState, useEffect } from 'react';

export default function ReorderTab({ companyId, companyName, contacts }: any) {
  const [dueItems, setDueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDueItems() {
      // Fetch from reorder views filtered by company
      setLoading(false);
      setDueItems([]); // TODO: Implement
    }
    fetchDueItems();
  }, [companyId]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Reorder Reminders for {companyName}</h2>
      <p className="text-gray-600 mb-6">Company-specific consumable reminders coming soon...</p>
    </div>
  );
}
