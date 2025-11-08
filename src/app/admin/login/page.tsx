/**
 * Simple Login Page
 * /admin/login
 * Select your role to access admin
 */

import LoginSelector from '@/components/admin/LoginSelector';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Technifold Admin</h1>
          <p className="text-gray-600">Select your account to continue</p>
        </div>

        <LoginSelector />
      </div>
    </div>
  );
}
