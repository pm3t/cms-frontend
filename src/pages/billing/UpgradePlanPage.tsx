import React, { useState } from 'react';
import { Check, Info, AlertTriangle } from 'lucide-react';
import { usePlans, useSubscription, useUpgradePlan } from '../../hooks/useBilling';

const FEATURE_LABELS: Record<string, string> = {
  // Free
  member_directory:        'Direktori & Database Jemaat',
  attendance_tracking:     'Pencatatan Kehadiran Ibadah',
  basic_reporting:         'Laporan Dasar Jemaat & Kehadiran',
  announcements:           'Pengumuman Gereja',
  // Basic
  event_management:        'Manajemen Acara & Jadwal Ibadah',
  small_groups:            'Kelompok Sel / Komunitas (Small Groups)',
  pastoral_care:           'Kunjungan & Konseling Pastoral',
  document_library:        'Perpustakaan Dokumen Digital',
  email_support:           'Dukungan Teknis via Email',
  // Pro
  advanced_reporting:      'Analisis & Laporan Keuangan Lanjutan',
  online_giving:           'Keuangan & Persembahan Online (QRIS/Transfer)',
  finance_advanced:        'Proyek Keuangan, Anggaran & Pledge',
  ministry_management:     'Manajemen Pelayanan & Relawan (Volunteer)',
  bulk_messaging:          'Kirim Pesan Masal (WhatsApp/Email)',
  facility_management:     'Peminjaman Ruangan & Fasilitas Gereja',
  digital_ministry:        'Khotbah Digital & Buletin Online',
  priority_support:        'Dukungan Prioritas 24/7',
  // Enterprise
  newsletter:              'Newsletter & Buletin Email Terjadwal',
  mobile_app_integration:  'Aplikasi Mobile Eklesia untuk Jemaat',
  api_access:              'Akses API untuk Integrasi Eksternal',
  custom_domain:           'Domain Kustom Website Gereja',
  dedicated_manager:       'Dedicated Account Manager',
  sso_authentication:      'Autentikasi SSO (Single Sign-On)',
  // Legacy alias
  all_pro_features:        'Semua Fitur Paket Pro',
};

const UpgradePlanPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: sub } = useSubscription();
  const upgradeMutation = useUpgradePlan();

  if (plansLoading) return <div className="p-8 text-center">Memuat pilihan paket...</div>;

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlanId) return;
    try {
      const result = await upgradeMutation.mutateAsync(selectedPlanId);
      
      // Get the payment URL from either location (to be safe)
      const paymentUrl = result.paymentUrl || result.invoice?.paymentUrl;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        // Redirect or show success (for downgrade/free)
        window.location.href = '/billing';
      }
    } catch (err) {
      alert('Gagal mengubah paket: ' + (err as Error).message);
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  const selectedPlan = plans?.find(p => p.id === selectedPlanId);
  const isDowngrade = selectedPlan && sub?.plan && selectedPlan.priceMonthly < Number(sub.plan.priceMonthly);

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-gray-900">Pilih Paket Gereja Anda</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tumbuhkan pelayanan Anda dengan fitur yang dirancang khusus untuk manajemen gereja modern.
        </p>

        {/* Toggle Bulanan/Tahunan */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>Bulanan</span>
          <button 
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-12 h-6 bg-blue-600 rounded-full relative p-1 transition-all"
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-all ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-400'}`}>
            Tahunan <span className="ml-1 text-green-500 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">Hemat 20%</span>
          </span>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans?.map((plan) => {
          const isCurrent = sub?.plan?.id === plan.id;
          const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
          
          return (
            <div 
              key={plan.id}
              className={`
                relative bg-white rounded-2xl shadow-xl border-2 flex flex-col p-8 transition-all hover:scale-105
                ${isCurrent ? 'border-blue-500 ring-4 ring-blue-50' : 'border-gray-100 hover:border-blue-200'}
              `}
            >
              {isCurrent && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  Paket Aktif
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price))}
                  </span>
                  <span className="ml-1 text-gray-500 font-medium">/{billingCycle === 'monthly' ? 'bln' : 'thn'}</span>
                </div>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                <li className="flex items-center text-sm text-gray-700">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  Maks. <strong>{plan.maxMembers || 'Unlimited'}</strong> Anggota
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  Maks. <strong>{plan.maxUsers || 'Unlimited'}</strong> Admin
                </li>
                {plan.features.map(f => (
                  <li key={f} className="flex items-start text-sm text-gray-600">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{FEATURE_LABELS[f] || f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent || upgradeMutation.isPending}
                onClick={() => handleSelectPlan(plan.id)}
                className={`
                  w-full py-3 rounded-xl font-bold transition-all shadow-md
                  ${isCurrent 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}
                  ${upgradeMutation.isPending && 'opacity-50 pointer-events-none'}
                `}
              >
                {isCurrent ? 'Sedang Digunakan' : (isDowngrade ? 'Pilih Paket Ini' : 'Upgrade Sekarang')}
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className={`p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 ${isDowngrade ? 'bg-amber-100' : 'bg-blue-100'}`}>
              {isDowngrade ? <AlertTriangle className="text-amber-600" /> : <Info className="text-blue-600" />}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Konfirmasi Perubahan Paket
            </h2>
            <p className="text-gray-600 mb-6">
              {isDowngrade 
                ? `Anda memilih untuk beralih ke paket ${selectedPlan?.name}. Perubahan ini akan efektif mulai periode penagihan berikutnya (${sub?.endDate ? new Date(sub.endDate).toLocaleDateString('id-ID') : ''}).`
                : `Anda akan melakukan upgrade ke paket ${selectedPlan?.name}. Anda akan dialihkan ke halaman pembayaran aman Xendit.`
              }
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button 
                onClick={handleConfirmUpgrade}
                disabled={upgradeMutation.isPending}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
              >
                {upgradeMutation.isPending ? 'Memproses...' : 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpgradePlanPage;
