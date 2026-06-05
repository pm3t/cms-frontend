import React from 'react';
import { Settings, Globe, Bell, Lock } from 'lucide-react';

const SuperAdminSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-500 text-sm">Konfigurasi global untuk seluruh ekosistem Eklesia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">General</h3>
          </div>
          <p className="text-sm text-gray-500 italic">Coming Soon: Global maintenance mode, support links, and platform-wide branding.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-5 w-5 text-red-600" />
            <h3 className="font-bold text-gray-900">Security</h3>
          </div>
          <p className="text-sm text-gray-500 italic">Coming Soon: Password policies, session timeouts, and IP whitelisting.</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSettingsPage;
