// Wrapper for SKU Explorer
'use client';

import { useEffect, useState } from 'react';
import SkuExplorer from '../SkuExplorer';

export default function SkuExplorerTab() {
  const [allSkus, setAllSkus] = useState([]);

  useEffect(() => {
    async function fetchSkus() {
      const response = await fetch('/api/admin/products?limit=1000');
      const data = await response.json();
      const skus = (data.products || []).map((p: any) => ({
        product_code: p.product_code,
        description: p.description
      }));
      setAllSkus(skus);
    }
    fetchSkus();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">SKU Explorer</h2>
      <SkuExplorer allSkus={allSkus} />
    </div>
  );
}
