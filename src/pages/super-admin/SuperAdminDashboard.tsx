import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  CheckCircle,
  FileText,
  ExternalLink
} from 'lucide-react';
import { 
  useTenants, 
  useRevenueSummary, 
  useSuperAdminInvoices 
} from '../../hooks/useSuperAdmin';
import InvoiceStatusBadge from '../../components/billing/InvoiceStatusBadge';

const SuperAdminDashboard: React.FC = () => {
  const { data: tenants, isLoading: tenantsLoading } = useTenants();
  const { data: revenue, isLoading: revenueLoading } = useRevenueSummary();
  const { data: invoices, isLoading: invoicesLoading } = useSuperAdminInvoices();

  if (tenantsLoading || revenueLoading || invoicesLoading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Memuat dashboard platform admin...</div>;
  }

  // Format IDR Currency
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const activeTenantsCount = tenants?.filter((t: any) => t.subscriptions?.[0]?.status === 'active').length || 0;
  const trialingTenantsCount = tenants?.filter((t: any) => t.subscriptions?.[0]?.status === 'trialing').length || 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Admin Overview</h1>
        <p className="text-gray-500 text-sm">Monitor seluruh aktivitas finansial, status langganan, dan performa bisnis tenant.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">MRR (Estimasi)</p>
            <h3 className="text-xl font-bold text-gray-900">{formatIDR(revenue?.mrr || 0)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Tenant Aktif</p>
            <h3 className="text-xl font-bold text-gray-900">{activeTenantsCount} / {tenants?.length || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Masa Trial Aktif</p>
            <h3 className="text-xl font-bold text-gray-900">{trialingTenantsCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Churn Bulan Ini</p>
            <h3 className="text-xl font-bold text-gray-900">{revenue?.churnedThisMonth || 0}</h3>
          </div>
        </div>
      </div>

      {/* Tenant Crucial Dates Monitoring */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Tanggal Penting & Status Tenant</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5">Nama Tenant</th>
                <th className="px-6 py-3.5">Paket Aktif</th>
                <th className="px-6 py-3.5">Status Langganan</th>
                <th className="px-6 py-3.5">Tgl Mulai</th>
                <th className="px-6 py-3.5">Tgl Berakhir (Tagihan Baru)</th>
                <th className="px-6 py-3.5">Selesai Trial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {tenants?.length > 0 ? tenants.map((tenant: any) => {
                const latestSub = tenant.subscriptions?.[0];
                return (
                  <tr key={tenant.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      <div>{tenant.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono font-normal">ID: {tenant.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                        {latestSub?.plan?.name || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize 
                        ${latestSub?.status === 'active' || latestSub?.status === 'trialing' ? 'bg-green-100 text-green-800' : 
                          latestSub?.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}
                      `}>
                        {latestSub?.status || 'inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {latestSub?.startDate ? new Date(latestSub.startDate).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {latestSub?.endDate ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(latestSub.endDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {latestSub?.trialEndsAt ? new Date(latestSub.trialEndsAt).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">Belum ada data tenant.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Invoices Monitoring */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Riwayat & Status Pembayaran Invoice</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5">Nama Tenant</th>
                <th className="px-6 py-3.5">Paket Terkait</th>
                <th className="px-6 py-3.5">Nominal</th>
                <th className="px-6 py-3.5">Tanggal Terbit</th>
                <th className="px-6 py-3.5">Tenggat Pembayaran</th>
                <th className="px-6 py-3.5">Status Bayar</th>
                <th className="px-6 py-3.5 text-right">Payment Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {invoices?.length > 0 ? invoices.map((invoice: any) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {invoice.tenant?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {invoice.subscription?.plan?.name || 'Subscription'}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {formatIDR(invoice.amount)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(invoice.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {new Date(invoice.dueDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  </td>
                  <td className="px-6 py-4">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {invoice.status === 'pending' && invoice.invoiceUrl ? (
                      <a 
                        href={invoice.invoiceUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded transition"
                      >
                        Xendit Link <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : '-'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 italic">Belum ada riwayat transaksi.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
