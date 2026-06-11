import React, { useState, useEffect } from 'react';
import { Users, Calendar, Wallet, TrendingUp } from 'lucide-react';
import { reportingService } from './reportingService';
import { useChartSize } from './useChartSize';

interface BarData { month: string; income: number; expense: number; }

function SVGBarChart({ data, width, height }: { data: BarData[]; width: number; height: number }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Belum ada data</div>;
  }
  const pad = { top: 16, right: 8, bottom: 36, left: 64 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);
  const groupW = w / data.length;
  const barW = Math.min(groupW * 0.35, 28);
  const gap = barW * 0.4;
  const fmt = (v: number) => v >= 1_000_000 ? `Rp${(v / 1_000_000).toFixed(0)}M` : `Rp${(v / 1000).toFixed(0)}K`;
  const ticks = 3;

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${pad.left},${pad.top})`}>
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const val = (maxVal / ticks) * (ticks - i);
          const y = h * (i / ticks);
          return (
            <g key={i}>
              <line x1={0} y1={y} x2={w} y2={y} stroke="#f3f4f6" strokeWidth={1} />
              <text x={-6} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{fmt(val)}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const cx = groupW * i + groupW / 2;
          const incH = (d.income / maxVal) * h;
          const expH = (d.expense / maxVal) * h;
          return (
            <g key={i}>
              <rect x={cx - gap / 2 - barW} y={h - incH} width={barW} height={incH} fill="#10b981" rx={2} />
              <rect x={cx + gap / 2} y={h - expH} width={barW} height={expH} fill="#ef4444" rx={2} />
              <text x={cx} y={h + 14} textAnchor="middle" fontSize={10} fill="#6b7280">{d.month}</text>
            </g>
          );
        })}
        <line x1={0} y1={h} x2={w} y2={h} stroke="#e5e7eb" strokeWidth={1} />
      </g>
      <g transform={`translate(${pad.left},${height - 10})`}>
        <rect width={8} height={8} fill="#10b981" rx={2} />
        <text x={12} y={8} fontSize={9} fill="#6b7280">Pemasukan</text>
        <rect x={75} width={8} height={8} fill="#ef4444" rx={2} />
        <text x={87} y={8} fontSize={9} fill="#6b7280">Pengeluaran</text>
      </g>
    </svg>
  );
}

export default function OverviewView() {
  const [kpis, setKpis] = useState<any>(null);
  const [finStats, setFinStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { ref, width, height } = useChartSize(256);

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
        {finStats && finStats.trend && (
          <div className="border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tren Keuangan 6 Bulan Terakhir</h3>
            <div ref={ref} className="h-64 w-full">
              <SVGBarChart data={finStats.trend} width={width} height={height} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
