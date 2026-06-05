import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, ExternalLink, ShieldCheck, Church, Calendar, CreditCard } from 'lucide-react';
import { useInvoiceDetail } from '../../hooks/useBilling';
import InvoiceStatusBadge from '../../components/billing/InvoiceStatusBadge';

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: invoice, isLoading } = useInvoiceDetail(id || '');

  if (isLoading) return <div className="p-8 text-center">Memuat detail tagihan...</div>;
  if (!invoice) return <div className="p-8 text-center text-red-600">Tagihan tidak ditemukan.</div>;

  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(invoice.amount);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link to="/billing/invoices" className="flex items-center text-gray-500 hover:text-gray-900 transition font-medium">
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
        </Link>
        <button 
          onClick={() => window.print()}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
        >
          <Printer className="h-4 w-4 mr-2" /> Cetak Halaman
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden print:border-0 print:shadow-none">
        {/* Header Invoice */}
        <div className="bg-slate-900 px-8 py-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Church className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold tracking-tight">EKLESIA</span>
            </div>
            <h1 className="text-3xl font-black">INVOICE</h1>
            <p className="text-slate-400 mt-1 uppercase tracking-widest text-xs font-bold">No: INV-{invoice.id.substring(0, 8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <InvoiceStatusBadge status={invoice.status} />
            <div className="mt-4">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Total Tagihan</p>
              <p className="text-3xl font-extrabold text-blue-400">{formattedAmount}</p>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Info Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2" /> Detail Waktu
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tgl. Terbit</p>
                  <p className="text-sm font-bold text-gray-900">
                    {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tgl. Bayar</p>
                  <p className="text-sm font-bold text-gray-900">
                    {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                <ShieldCheck className="h-4 w-4 mr-2" /> Info Pembayaran
              </h3>
              <p className="text-xs text-gray-500 mb-1">ID Transaksi (Xendit)</p>
              <p className="text-sm font-mono font-bold text-gray-900 break-all">{invoice.xenditInvoiceId || 'N/A'}</p>
            </div>
          </div>

          {/* Action Section */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Status Pembayaran</h3>
              <p className="text-sm text-gray-600">
                {invoice.status === 'paid' 
                  ? 'Pembayaran Anda telah berhasil diproses. Terima kasih telah berlangganan Eklesia.'
                  : 'Tagihan ini masih menunggu pembayaran. Silakan klik tombol di bawah untuk melunasi tagihan.'
                }
              </p>
            </div>

            {invoice.status === 'pending' && invoice.invoiceUrl && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <a 
                  href={invoice.invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                  <CreditCard className="h-5 w-5 mr-2" /> Bayar Sekarang <ExternalLink className="ml-2 h-4 w-4 opacity-50" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 italic">
            Ini adalah dokumen resmi yang dihasilkan secara otomatis oleh sistem penagihan Eklesia. 
            Jika ada pertanyaan mengenai tagihan ini, silakan hubungi support@eklesia.id
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
