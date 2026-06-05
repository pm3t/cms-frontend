import React, { useState, useEffect } from 'react';
import { Users, Calendar, Wallet, TrendingUp } from 'lucide-react';
import { reportingService } from './reportingService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OverviewView() {
  const [kpis, setKpis] = useState<any>(null);
  const [finStats, setFinStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportingService.getDashboardKPIs(),
      reportingService.getFinancialStats()
    ])
    .then(([k, f]) => { setKpis(k); setFinStats(f); })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Memuat KPI...</p>
      </div>
    );
  }

  if (!kpis) return null;

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Jemaat</p>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{kpis.totalMembers}</p>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Calendar className="w-5 h-5" /></div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Reservasi Aktif</p>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{kpis.totalBookings}</p>
          {kpis.pendingBookings > 0 && <p className="text-xs font-semibold text-amber-600 mt-1">{kpis.pendingBookings} menunggu persetujuan</p>}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Pemasukan Bln Ini</p>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">Rp {kpis.incomeThisMonth.toLocaleString('id-ID')}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Wallet className="w-5 h-5" /></div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Pengeluaran Bln Ini</p>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">Rp {kpis.expenseThisMonth.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Mini Charts Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Trend Preview */}
        {finStats && finStats.trend && (
          <div className="border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tren Keuangan 6 Bulan Terakhir</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finStats.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `Rp${(val/1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                  <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
