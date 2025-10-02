'use client';

interface ToolWithConsumables {
  tool: {
    product_code: string;
    description: string;
    category?: string;
    type: string;
    [key: string]: unknown;
  };
  consumables: Array<{
    product_code: string;
    description: string;
    category?: string;
    type: string;
    [key: string]: unknown;
  }>;
}

interface Props {
  toolsWithConsumables: ToolWithConsumables[];
}

export function ToolsAndConsumablesSection({ toolsWithConsumables }: Props) {
  if (!toolsWithConsumables || toolsWithConsumables.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Tools & Consumables Purchased</h3>
        <p className="text-sm text-gray-500 mt-1">Equipment and their compatible consumables</p>
      </div>
      <div className="p-6 space-y-6">
        {toolsWithConsumables.map((item, index) => (
          <div key={`tool-group-${index}`} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
            {/* Tool */}
            <div className="mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <img
                    src={`/product_images/${item.tool.product_code}.jpg`}
                    alt={item.tool.description}
                    className="w-full h-full object-contain p-2 rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/product-placeholder.svg';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.tool.description}</h4>
                  <p className="text-sm text-gray-500 font-mono">{item.tool.product_code}</p>
                  {item.tool.category && (
                    <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {item.tool.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Consumables for this tool */}
            {item.consumables.length > 0 ? (
              <div className="ml-28">
                <p className="text-xs font-medium text-gray-700 mb-3">Compatible consumables purchased:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {item.consumables.map((consumable) => (
                    <div key={consumable.product_code} className="border border-gray-200 rounded-lg p-2">
                      <div className="aspect-square bg-gray-50 rounded mb-2">
                        <img
                          src={`/product_images/${consumable.product_code}.jpg`}
                          alt={consumable.description}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/product-placeholder.svg';
                          }}
                        />
                      </div>
                      <h5 className="text-xs font-medium text-gray-900 truncate" title={consumable.description}>
                        {consumable.description}
                      </h5>
                      <p className="text-xs text-gray-500 font-mono truncate">{consumable.product_code}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="ml-28">
                <p className="text-sm text-amber-600 italic">
                  ⚠️ No compatible consumables purchased yet
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}