'use client';

interface QuoteItem {
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  product_type: 'tool';
  category?: string;
  image_url?: string;
}

interface StaticToolQuoteViewerProps {
  items: QuoteItem[];
  companyName: string;
  contactName?: string;
  token: string;
}

export default function StaticToolQuoteViewer({
  items,
  companyName,
  contactName,
  token,
}: StaticToolQuoteViewerProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const totalDiscount = items.reduce((sum, item) =>
    sum + ((item.unit_price * item.quantity * item.discount_percent) / 100), 0
  );
  const total = subtotal - totalDiscount;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tool Quote</h1>
              <p className="text-gray-600">{companyName}</p>
              {contactName && <p className="text-gray-500 text-sm">Attn: {contactName}</p>}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Valid for 30 days</div>
              <div className="text-sm text-gray-500">{new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Quote Items */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>

            <div className="space-y-4">
              {items.map((item) => {
                const itemSubtotal = item.unit_price * item.quantity;
                const itemDiscount = (itemSubtotal * item.discount_percent) / 100;
                const itemTotal = itemSubtotal - itemDiscount;

                return (
                  <div key={item.product_code} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.description}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-lg">{item.description}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {item.product_code} • Quantity: {item.quantity}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        £{item.unit_price.toFixed(2)} per unit
                        {item.discount_percent > 0 && (
                          <span className="ml-2 text-green-600 font-semibold">
                            ({item.discount_percent}% off)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        £{itemTotal.toFixed(2)}
                      </div>
                      {item.discount_percent > 0 && (
                        <div className="text-sm text-gray-500 line-through mt-1">
                          £{itemSubtotal.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200 space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">£{subtotal.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Total Discount</span>
                  <span className="font-semibold text-green-600">-£{totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold pt-3 border-t border-gray-200">
                <span>Total</span>
                <span className="text-blue-600">£{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                window.location.href = `/checkout?token=${token}`;
              }}
              className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition"
            >
              Accept Quote & Proceed to Checkout
            </button>
            <p className="text-center text-sm text-gray-500 mt-3">
              Fixed pricing • Valid for 30 days
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Tech-ni-Fold Ltd • World-Leading Print Finishing Solutions</p>
        </div>
      </div>
    </div>
  );
}
