import React, { useState } from 'react';
import { Database, Download, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../../lib/axios';

const SuperAdminBackupPage: React.FC = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    setError(null);
    setSuccess(false);

    try {
      // Fetch as blob to handle errors cleanly and show proper loading state
      const response = await api.get('/super-admin/backup-db', {
        responseType: 'blob',
      });

      // Create blob and download link
      const blob = new Blob([response.data], { type: 'application/sql' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from headers if available
      const contentDisposition = response.headers['content-disposition'];
      let filename = `backup-db-${new Date().toISOString().slice(0, 10)}.sql`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err: any) {
      console.error('Backup failed:', err);
      setError('Gagal mencadangkan database. Pastikan server database sedang aktif dan coba beberapa saat lagi.');
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Backup & Recovery</h1>
        <p className="text-gray-500 text-sm mt-1">
          Unduh salinan data seluruh platform Eklesia secara langsung ke perangkat Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Control Panel Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Database className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-lg">Cadangkan Database PostgreSQL</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Proses ini akan mengumpulkan seluruh tabel database (multi-tenant, user, persembahan, sacrament, dll.) dan memformatnya menjadi file SQL terkompresi. Triggers dan foreign key checks akan dinonaktifkan sementara di dalam file SQL untuk memastikan kelancaran restorasi data.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-semibold text-gray-700">Neon Cloud Database (PostgreSQL)</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-green-50 text-green-700 font-semibold rounded-full">
                    Terkoneksi
                  </span>
                </div>

                <div className="text-xs text-gray-500 bg-blue-50/50 p-4 rounded-xl border border-blue-50 leading-relaxed">
                  <span className="font-bold text-blue-800">Catatan Restorasi:</span> File backup ini dirancang dengan instruksi <code className="bg-blue-100/60 px-1 py-0.5 rounded font-mono text-blue-900">SET session_replication_role = 'replica'</code>. Saat memulihkan database, pastikan Anda telah menjalankan migrasi schema terlebih dahulu (<code className="bg-blue-100/60 px-1 py-0.5 rounded font-mono text-blue-900">npx prisma db push</code>), kemudian jalankan file SQL ini untuk mengisi seluruh data.
                </div>
              </div>
            </div>

            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 text-green-800 rounded-xl border border-green-100">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium">Database berhasil dicadangkan dan file SQL telah terunduh otomatis!</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-800 rounded-xl border border-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end">
              <button
                onClick={handleBackup}
                disabled={isBackingUp}
                className={`flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none`}
              >
                {isBackingUp ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses Backup...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Mulai Backup & Unduh
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Informational Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 h-fit">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Spesifikasi Backup</h3>
          </div>

          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <div className="text-gray-600">
                <strong className="text-gray-800">Format Backup:</strong> SQL standard script (.sql) berisi perintah DML (inserts).
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <div className="text-gray-600">
                <strong className="text-gray-800">Integritas Data:</strong> Menggunakan perintah TRUNCATE RESTART IDENTITY CASCADE sebelum insert untuk membersihkan data lama secara aman.
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <div className="text-gray-600">
                <strong className="text-gray-800">Kompatibilitas:</strong> PostgreSQL 15 ke atas (termasuk Neon Cloud & Postgres Local Docker).
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <div className="text-gray-600">
                <strong className="text-gray-800">Keamanan:</strong> Dilakukan secara aman melalui koneksi SSL backend terverifikasi, langsung dari cache server hosting.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminBackupPage;
