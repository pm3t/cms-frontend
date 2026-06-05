import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const PaymentSuccessPage: React.FC = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate subscription data to force a refresh after 3 seconds
    // This accounts for background webhook processing delays
    const timer = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'subscription'] });
    }, 3000);

    return () => clearTimeout(timer);
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-green-100 p-6 rounded-full mb-8 animate-bounce">
        <CheckCircle2 className="h-20 w-20 text-green-600" />
      </div>

      <h1 className="text-4xl font-black text-gray-900 mb-4">Pembayaran Berhasil!</h1>
      <p className="text-lg text-gray-600 max-w-md mb-12">
        Terima kasih! Pembayaran Anda telah kami terima dan paket berlangganan Anda akan segera diperbarui secara otomatis.
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-12 flex items-center gap-4 text-left">
        <div className="bg-blue-600 p-2 rounded-lg">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900">Verifikasi Langganan</h4>
          <p className="text-xs text-gray-500">Sistem kami sedang melakukan sinkronisasi dengan gateway pembayaran.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link 
          to="/dashboard"
          className="flex-1 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2"
        >
          Ke Dashboard <ArrowRight className="h-5 w-5" />
        </Link>
        <Link 
          to="/billing/invoices"
          className="flex-1 px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
        >
          Lihat Invoice
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
