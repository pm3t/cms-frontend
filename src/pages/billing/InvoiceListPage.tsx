import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, ExternalLink, ChevronRight } from 'lucide-react';
import { useInvoices } from '../../hooks/useBilling';
import type { Invoice } from '../../types/billing';
import InvoiceStatusBadge from '../../components/billing/InvoiceStatusBadge';

const InvoiceListPage: React.FC = () => {
  const { data: invoices, isLoading } = useInvoices();

  if (isLoading) return <div className="p-8 text-center">Memuat riwayat tagihan...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Tagihan</h1>
          <p className="text-gray-500 text-sm">Kelola dan pantau semua transaksi pembayaran gereja Anda.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">No. Tagihan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nominal</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices && invoices.length > 0 ? invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">INV-{invoice.id.substring(0, 8).toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(invoice.amount))}
                  </td>
                  <td className="px-6 py-4">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {invoice.status === 'pending' && invoice.invoice_url && (
                      <a 
                        href={invoice.invoice_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition"
                      >
                        Bayar Sekarang <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    )}
                    <Link 
                      to={`/billing/invoices/${invoice.id}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-gray-600 text-xs font-bold rounded hover:bg-gray-50 transition"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-200 mb-2" />
                      <p className="text-gray-500 italic">Belum ada riwayat tagihan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 flex items-start gap-4">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Download className="h-5 w-5 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-blue-900">Butuh Invoice untuk Laporan?</h4>
          <p className="text-sm text-blue-700 mt-1">
            Anda dapat melihat detail dan bukti pembayaran untuk setiap transaksi. Jika membutuhkan invoice fisik dalam format PDF, silakan hubungi tim support kami.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceListPage;
