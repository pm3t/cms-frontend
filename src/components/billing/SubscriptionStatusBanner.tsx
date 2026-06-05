import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SubscriptionStatus } from '../../types/billing';

interface SubscriptionStatusBannerProps {
  status: SubscriptionStatus;
}

const SubscriptionStatusBanner: React.FC<SubscriptionStatusBannerProps> = ({ status }) => {
  if (status === 'active' || status === 'trialing' || status === 'cancelled') return null;

  if (status === 'past_due') {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
            <p className="text-sm text-amber-800 font-medium">
              Tagihan Anda telah melewati jatuh tempo. Silakan lakukan pembayaran untuk menghindari penghentian layanan.
            </p>
          </div>
          <Link
            to="/billing/invoices"
            className="text-sm font-bold text-amber-900 underline hover:text-amber-700"
          >
            Bayar Sekarang
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'suspended') {
    // Don't block if we are already on a billing-related page
    const isBillingPage = window.location.pathname.startsWith('/billing');
    if (isBillingPage) return null;

    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <ShieldAlert className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Akun Ditangguhkan</h1>
        <p className="text-gray-600 max-w-md mb-8">
          Layanan Anda telah dihentikan sementara karena tunggakan pembayaran. 
          Silakan hubungi administrator atau lakukan pelunasan tagihan melalui halaman billing.
        </p>
        <div className="flex gap-4">
          <Link
            to="/billing/invoices"
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Lihat Tagihan
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cek Status Kembali
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default SubscriptionStatusBanner;
