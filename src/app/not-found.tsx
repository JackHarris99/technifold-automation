export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-6 text-center">
        <div className="mb-4">
          <h1 className="text-6xl font-bold text-gray-400 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Portal Not Found</h2>
          <p className="text-gray-600 text-sm">
            The portal token you're looking for doesn't exist or has expired.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-blue-800 text-sm">
              If you received this link via email, please check that you copied the entire URL correctly.
            </p>
          </div>
          
          <div className="text-xs text-gray-500">
            For assistance, please contact your Technifold representative.
          </div>
        </div>
      </div>
    </div>
  );
}