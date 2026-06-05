import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, HelpCircle, RefreshCcw, ArrowLeft } from 'lucide-react';

const PaymentFailedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-100 p-6 rounded-full mb-8">
        <XCircle className="h-20 w-20 text-red-600" />
      </div>

      <h1 className="text-4xl font-black text-gray-900 mb-4">Pembayaran Gagal</h1>
      <p className="text-lg text-gray-600 max-w-md mb-12">
        Maaf, pembayaran Anda tidak dapat diproses saat ini. Hal ini bisa terjadi karena saldo tidak mencukupi atau kendala pada bank Anda.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-12">
        <div className="p-4 border border-gray-200 rounded-xl flex items-start gap-3 text-left hover:bg-gray-50 transition cursor-pointer">
          <RefreshCcw className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Coba Lagi</h4>
            <p className="text-xs text-gray-500">Anda dapat mencoba membayar kembali melalui daftar invoice.</p>
          </div>
        </div>
        <div className="p-4 border border-gray-200 rounded-xl flex items-start gap-3 text-left hover:bg-gray-50 transition cursor-pointer">
          <HelpCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Hubungi Support</h4>
            <p className="text-xs text-gray-500">Bantuan 24/7 jika Anda mengalami masalah teknis.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link 
          to="/billing/invoices"
          className="flex-1 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          Lihat Riwayat Invoice
        </Link>
        <Link 
          to="/dashboard"
          className="flex-1 px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" /> Ke Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
