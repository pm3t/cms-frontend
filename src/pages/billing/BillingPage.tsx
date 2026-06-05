import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  AlertCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useSubscription, useInvoices } from '../../hooks/useBilling';
import type { Subscription, Invoice } from '../../types/billing';
import PlanBadge from '../../components/billing/PlanBadge';
import InvoiceStatusBadge from '../../components/billing/InvoiceStatusBadge';

const FEATURE_LABELS: Record<string, string> = {
  attendance_tracking: 'Pencatatan Kehadiran',
  basic_reporting: 'Laporan Dasar',
  member_directory: 'Direktori Jemaat',
  event_management: 'Manajemen Acara',
  small_groups: 'Manajemen Sel/Komunitas',
  email_support: 'Support Email',
  advanced_reporting: 'Laporan Keuangan Lanjutan',
  bulk_messaging: 'Pesan Masal',
  online_giving: 'Persembahan Online',
  ministry_management: 'Manajemen Pelayanan',
  priority_support: 'Support Prioritas 24/7',
  all_pro_features: 'Semua Fitur Pro',
  custom_domain: 'Domain Kustom',
  dedicated_manager: 'Dedicated Manager',
  api_access: 'Akses API',
  mobile_app_integration: 'Aplikasi Mobile Eklesia',
  sso_authentication: 'Autentikasi SSO',
};

const BillingPage: React.FC = () => {
  const { data: sub, isLoading: subLoading } = useSubscription();
  const { data: invoices, isLoading: invLoading } = useInvoices();

  if (subLoading || invLoading) {
    return <div className="p-8 text-center">Memuat data billing...</div>;
  }

  const latestInvoices = invoices?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Langganan</h1>
        <Link 
          to="/billing/upgrade"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Kelola Paket
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subscription Status Card */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Paket Saat Ini</p>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-gray-900">{sub?.plan?.name}</h2>
                {sub?.plan && <PlanBadge planName={sub.plan.name} />}
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold capitalize 
              ${sub?.status === 'active' || sub?.status === 'trialing' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
            `}>
              {sub?.status}
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Berakhir Pada</p>
                <p className="text-sm font-bold text-gray-900">
                  {sub?.endDate ? new Date(sub.endDate).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                </p>
              </div>
            </div>
            {sub?.status === 'trialing' && (
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-blue-500 font-medium uppercase">Masa Trial</p>
                  <p className="text-sm font-bold text-gray-900">
                    Berakhir {sub.trialEndsAt ? new Date(sub.trialEndsAt).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
              </div>
            )}
            {sub?.pendingPlanId && (
              <div className="sm:col-span-2 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Perubahan paket terjadwal: Akan beralih pada {sub.pendingPlanEffectiveAt ? new Date(sub.pendingPlanEffectiveAt).toLocaleDateString('id-ID') : ''}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Ringkasan Fitur</h3>
          <ul className="space-y-3">
            <li className="flex justify-between text-sm">
              <span className="text-gray-500">Maks. Anggota</span>
              <span className="font-bold">{sub?.plan?.maxMembers || 'Unlimited'}</span>
            </li>
            <li className="flex justify-between text-sm">
              <span className="text-gray-500">Maks. User Admin</span>
              <span className="font-bold">{sub?.plan?.maxUsers || 'Unlimited'}</span>
            </li>
            <li className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Fitur Utama:</p>
              <div className="flex flex-wrap gap-2">
                {sub?.plan?.features?.slice(0, 4).map(f => (
                  <span key={f} className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600">
                    {FEATURE_LABELS[f] || f.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </li>
          </ul>
        </div>
      </div>

      {sub?.pendingPlan && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-900">Perubahan Paket Terjadwal</h4>
            <p className="text-sm text-amber-800">
              Anda telah menjadwalkan pindah ke paket <strong>{sub.pendingPlan.name}</strong>. 
              Perubahan ini akan efektif pada <strong>{sub.pendingPlanEffectiveAt ? new Date(sub.pendingPlanEffectiveAt).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Latest Invoices */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Tagihan Terakhir</h3>
          <Link to="/billing/invoices" className="text-sm text-blue-600 font-bold flex items-center hover:underline">
            Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-6 py-3">Nominal</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {latestInvoices.length > 0 ? latestInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(inv.amount))}
                  </td>
                  <td className="px-6 py-4">
                    <InvoiceStatusBadge status={inv.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {inv.status === 'pending' && inv.invoiceUrl && (
                      <a 
                        href={inv.invoiceUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 p-1 rounded inline-block"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">Belum ada riwayat tagihan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
