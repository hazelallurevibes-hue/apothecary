import { Link } from 'react-router-dom';

export default function PermissionDenied({ user }) {
  const isCustomer = (user?.role || '').toLowerCase() === 'customer';

  return (
    <div className="text-center py-20 max-w-md mx-auto">
      <div className="text-8xl mb-6">403</div>
      <h1 className="text-3xl font-semibold">Permission Denied</h1>
      <p className="mt-2 text-gray-600">
        You don&apos;t have access to this page with your current plan or role.
      </p>
      {isCustomer && (
        <p className="mt-3 text-sm text-gray-500">
          If you recently upgraded to Pro, open{' '}
          <Link to="/pro-upgrade" className="text-[#4a1942] font-medium underline">Pro benefits</Link>
          {' '}or refresh from Account Settings — your perks may need a moment to sync.
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Link to="/" className="px-8 py-3 bg-[#4a1942] text-white rounded-3xl">Return to Home</Link>
        {isCustomer && (
          <Link to="/customer-portal" className="px-8 py-3 border rounded-3xl font-medium">Seeker portal</Link>
        )}
      </div>
    </div>
  );
}