import React from 'react';
import { Users, Shield, UserPlus } from 'lucide-react';

const SuperAdminUsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management (Platform)</h1>
          <p className="text-gray-500 text-sm">Kelola akses staff internal dan administrator platform.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
          <UserPlus className="h-4 w-4 mr-2" /> Tambah Staff
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 flex items-start gap-4">
        <div className="bg-amber-100 p-2 rounded-lg">
          <Shield className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h4 className="font-bold text-amber-900">Modul Sedang Dikembangkan</h4>
          <p className="text-sm text-amber-700 mt-1">
            Fitur manajemen role granular dan audit log staff sedang dalam tahap pengembangan akhir.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <Users className="h-16 w-16 text-gray-200 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900">Daftar Staff Platform</h3>
        <p className="text-gray-500 max-w-sm mx-auto mt-2">
          Hanya pengguna dengan role Super Admin yang dapat melihat daftar ini.
        </p>
      </div>
    </div>
  );
};

export default SuperAdminUsersPage;
