/**
 * Login Selector
 * Choose sales rep or director role
 */

'use client';

export default function LoginSelector() {
  const users = [
    { rep_id: 'rep_001', rep_name: 'Lee', email: 'lee@technifold.com', role: 'sales_rep' as const, color: 'red' },
    { rep_id: 'rep_002', rep_name: 'Callum', email: 'callum@technifold.com', role: 'sales_rep' as const, color: 'blue' },
    { rep_id: 'rep_003', rep_name: 'Steve', email: 'steve@technifold.com', role: 'sales_rep' as const, color: 'green' },
    { rep_id: 'director_001', rep_name: 'Jack (Director)', email: 'jack@technifold.com', role: 'director' as const, color: 'purple' },
    { rep_id: 'director_002', rep_name: 'Director 2', email: 'director2@technifold.com', role: 'director' as const, color: 'orange' },
  ];

  const handleLogin = async (user: typeof users[0]) => {
    const response = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    if (response.ok) {
      window.location.href = '/admin';
    } else {
      alert('Login failed');
    }
  };

  return (
    <div className="space-y-3">
      {users.map(user => (
        <button
          key={user.rep_id}
          onClick={() => handleLogin(user)}
          className={`w-full p-4 border-2 rounded-lg text-left hover:shadow-lg transition-all border-${user.color}-500 hover:border-${user.color}-600 hover:bg-${user.color}-50`}
        >
          <div className="font-bold text-gray-900">{user.rep_name}</div>
          <div className="text-sm text-gray-600">{user.email}</div>
          <div className="text-xs text-gray-500 mt-1">{user.role === 'director' ? 'Full Access' : 'Sales Territory'}</div>
        </button>
      ))}
    </div>
  );
}
