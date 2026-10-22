import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ModuleRouteProps {
  moduleKey: string;
}

const ModuleRoute: React.FC<ModuleRouteProps> = ({ moduleKey }) => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Super Admin has all access
  if (user?.role === 'Super Admin') {
    return <Outlet />;
  }

  // If user permissions are not defined on user (legacy fallback), allow access
  if (!user?.permissions) {
    return <Outlet />;
  }

  const hasAccess = user.permissions.includes(moduleKey) || user.permissions.includes('*');

  if (!hasAccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-16 w-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4 border border-red-100 shadow-sm">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Akses Modul Terbatas</h2>
        <p className="text-sm text-gray-500 max-w-md mb-6">
          Akun Anda tidak memiliki hak akses untuk modul ini. Hubungi administrator gereja Anda jika Anda memerlukan akses ke halaman ini.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
        >
          Kembali ke Dashboard
        </a>
      </div>
    );
  }

  return <Outlet />;
};

export default ModuleRoute;

