/**
 * Consumables Section
 * Shows consumable purchase history from company_consumables fact table
 */

'use client';

interface Consumable {
  consumable_code: string;
  first_ordered_at: string;
  last_ordered_at: string;
  total_orders: number;
  total_quantity: number;
  last_order_amount: number;
  products?: {
    description: string;
    category: string;
    price: number;
  };
}

interface ConsumablesSectionProps {
  consumables: Consumable[];
}

export default function ConsumablesSection({ consumables }: ConsumablesSectionProps) {
  // Calculate days since last order for reorder opportunity detection
  const getDaysSinceLastOrder = (lastOrderedAt: string) => {
    const lastOrder = new Date(lastOrderedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastOrder.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Consumables History ({consumables.length})
      </h2>

      {consumables.length === 0 ? (
        <p className="text-gray-600 text-sm">No consumable purchases</p>
      ) : (
        <div className="space-y-3">
          {consumables.map((consumable) => {
            const daysSinceLastOrder = getDaysSinceLastOrder(consumable.last_ordered_at);
            const isReorderOpportunity = daysSinceLastOrder > 90;

            return (
              <div
                key={consumable.consumable_code}
                className={`border rounded-lg p-4 ${
                  isReorderOpportunity ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {consumable.products?.description || consumable.consumable_code}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Code: {consumable.consumable_code}
                      {consumable.products?.category && ` • ${consumable.products.category}`}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-600">Total orders:</span>{' '}
                        <span className="font-semibold">{consumable.total_orders}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total quantity:</span>{' '}
                        <span className="font-semibold">{consumable.total_quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last order:</span>{' '}
                        <span className="font-semibold">
                          {new Date(consumable.last_ordered_at).toLocaleDateString('en-GB')}
                        </span>
                        {isReorderOpportunity && (
                          <span className="ml-2 text-xs bg-orange-600 text-white px-2 py-0.5 rounded">
                            {daysSinceLastOrder} days ago
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-600">Last amount:</span>{' '}
                        <span className="font-semibold">
                          £{consumable.last_order_amount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
