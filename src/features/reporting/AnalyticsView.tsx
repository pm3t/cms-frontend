import React, { useState, useEffect } from 'react';
import { reportingService } from './reportingService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Users, HeartHandshake, Wallet } from 'lucide-react';

export default function AnalyticsView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportingService.getGrowthAnalytics(),
      reportingService.getEngagementMetrics(),
      reportingService.getFinancialAnalytics(),
      reportingService.getBenchmarking()
    ])
    .then(([growth, eng, fin, bench]) => {
      setData({ growth, eng, fin, bench });
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat analisis mendalam...</div>;
  if (!data) return null;

  const renderKPI = (title: string, current: number, mom: number, prefix = '', suffix = '') => {
    const isPositive = mom >= 0;
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">{title}</p>
        <p className="text-3xl font-extrabold text-gray-900">{prefix}{current.toLocaleString('id-ID')}{suffix}</p>
        <div className={`flex items-center gap-1 mt-2 text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{Math.abs(mom).toFixed(1)}% vs bulan lalu</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* KPI Benchmarking */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderKPI('Pertumbuhan Jemaat', data.bench.growth.current, data.bench.growth.mom)}
        {renderKPI('Kehadiran Rata-rata', data.bench.attendance.current, data.bench.attendance.mom)}
        {renderKPI('Pemasukan Total', data.bench.finance.current, data.bench.finance.mom, 'Rp ')}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Analytics */}
        <div className="border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Tren Pertumbuhan Jemaat</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6">Penambahan jemaat baru per bulan selama 12 bulan terakhir.</p>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.growth.trend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="newMembers" name="Jemaat Baru" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement & Finance Analytics */}
        <div className="space-y-6">
          {/* Engagement */}
          <div className="border border-gray-100 rounded-2xl p-6 shadow-sm bg-gradient-to-br from-indigo-50 to-white">
            <div className="flex items-center gap-2 mb-4">
              <HeartHandshake className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">Engagement & Partisipasi</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm text-center">
                <p className="text-3xl font-extrabold text-indigo-600">{data.eng.participationRate}%</p>
                <p className="text-xs font-bold text-gray-500 mt-1 uppercase">Tingkat Partisipasi</p>
                <p className="text-xs text-gray-400 mt-2">dari {data.eng.totalActiveMembers} anggota aktif</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm text-center">
                <p className="text-3xl font-extrabold text-indigo-600">{data.eng.averageWeeklyAttendance}</p>
                <p className="text-xs font-bold text-gray-500 mt-1 uppercase">Hadir Rata-rata</p>
                <p className="text-xs text-gray-400 mt-2">per minggu (bln ini)</p>
              </div>
            </div>
          </div>

          {/* Giving Patterns */}
          <div className="border border-gray-100 rounded-2xl p-6 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-gray-900">Pola Pemberian (Giving Patterns)</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm text-center">
                <p className="text-xl font-extrabold text-emerald-600">Rp {(data.fin.averageGivingPerCapita || 0).toLocaleString('id-ID')}</p>
                <p className="text-xs font-bold text-gray-500 mt-1 uppercase">Rata-rata Per Kapita</p>
                <p className="text-xs text-gray-400 mt-2">kontribusi 6 bln terakhir</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm text-center">
                <p className="text-3xl font-extrabold text-emerald-600">{data.fin.giverPercentage}%</p>
                <p className="text-xs font-bold text-gray-500 mt-1 uppercase">Anggota Berkontribusi</p>
                <p className="text-xs text-gray-400 mt-2">tercatat secara nominal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
