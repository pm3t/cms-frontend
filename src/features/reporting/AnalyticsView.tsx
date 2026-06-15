import React, { useState, useEffect } from 'react';
import { reportingService } from './reportingService';
import { TrendingUp, TrendingDown, Users, HeartHandshake, Wallet, Smartphone } from 'lucide-react';
import { useChartSize } from './useChartSize';

interface GrowthPoint { month: string; newMembers: number; }

function SVGGrowthChart({ data, width, height }: { data: GrowthPoint[]; width: number; height: number }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Belum ada data pertumbuhan</div>;
  }

  const pad = { top: 16, right: 16, bottom: 36, left: 32 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const maxVal = Math.max(...data.map(d => d.newMembers), 1);
  const step = data.length > 1 ? w / (data.length - 1) : w;

  const points = data.map((d, i) => ({
    x: data.length > 1 ? i * step : w / 2,
    y: h - (d.newMembers / maxVal) * h,
    ...d
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
        </linearGradient>
      </defs>
      <g transform={`translate(${pad.left},${pad.top})`}>
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
          <line key={i} x1={0} y1={h * frac} x2={w} y2={h * frac} stroke="#f3f4f6" strokeWidth={1} />
        ))}

        {/* Area */}
        <path
          d={`${pathD} L ${points[points.length - 1].x.toFixed(1)} ${h} L ${points[0].x.toFixed(1)} ${h} Z`}
          fill="url(#growthGrad)"
          opacity={0.2}
        />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="white" stroke="#3b82f6" strokeWidth={2} />
        ))}

        {/* X Labels — show only first, middle, and last to avoid clutter */}
        {points.filter((_, i) => i === 0 || i === Math.floor(points.length / 2) || i === points.length - 1).map((p, i) => (
          <text key={i} x={p.x} y={h + 16} textAnchor="middle" fontSize={10} fill="#9ca3af">{p.month}</text>
        ))}

        {/* X Axis */}
        <line x1={0} y1={h} x2={w} y2={h} stroke="#e5e7eb" strokeWidth={1} />
      </g>
    </svg>
  );
}

export default function AnalyticsView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { ref, width, height } = useChartSize(256);

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
          
          <div ref={ref} className="h-64 w-full">
            <SVGGrowthChart data={data.growth?.trend || []} width={width} height={height} />
          </div>
        </div>

        {/* Engagement & Finance Analytics */}
        <div className="space-y-6">
          {/* Engagement */}
          <div className="border border-gray-100 rounded-2xl p-6 shadow-sm bg-gradient-to-br from-indigo-50 to-white">
            <div className="flex items-center gap-2 mb-4">
              <HeartHandshake className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">Engagement &amp; Partisipasi</h3>
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

          {/* Mobile App Engagement Analytics */}
          {data.eng.mobileMetrics && (
            <div className="border border-gray-100 rounded-2xl p-6 shadow-sm bg-gradient-to-br from-blue-50 to-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Engagement Aplikasi Mobile</h3>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {data.eng.mobileMetrics.totalActiveMobile30d} Aktif (30 Hari)
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm text-center">
                  <p className="text-2xl font-extrabold text-blue-600">{data.eng.mobileMetrics.totalRegisteredMobile}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Jemaat Terdaftar</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm text-center">
                  <p className="text-2xl font-extrabold text-blue-600">
                    {data.eng.totalActiveMembers > 0 ? Math.round((data.eng.mobileMetrics.totalRegisteredMobile / data.eng.totalActiveMembers) * 100) : 0}%
                  </p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Tingkat Adopsi</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pola Adopsi & Keaktifan per Demografi</h4>
                {[
                  { key: 'YOUTH', label: 'Remaja / Pemuda' },
                  { key: 'ADULT', label: 'Dewasa' },
                  { key: 'ELDERLY', label: 'Lansia' },
                  { key: 'CHILDREN', label: 'Anak-anak' }
                ].map(cat => {
                  const total = data.eng.mobileMetrics.totalPerCategory[cat.key] || 0;
                  const registered = data.eng.mobileMetrics.registeredPerCategory[cat.key] || 0;
                  const active = data.eng.mobileMetrics.activeCountPerCategory[cat.key] || 0;
                  const adoptionRate = total > 0 ? Math.round((registered / total) * 100) : 0;
                  const activeRateOfRegistered = registered > 0 ? Math.round((active / registered) * 100) : 0;

                  return (
                    <div key={cat.key} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span>{cat.label}</span>
                        <span className="text-gray-500">
                          {registered}/{total} Terdaftar ({adoptionRate}%) • {active} Aktif ({activeRateOfRegistered}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200/70 h-2.5 rounded-full overflow-hidden flex">
                        {/* Active part in indigo */}
                        <div 
                          className="bg-indigo-600 h-full rounded-l-full" 
                          style={{ width: `${total > 0 ? (active / total) * 100 : 0}%` }}
                          title={`${active} jemaat aktif dalam 30 hari terakhir`}
                        />
                        {/* Registered but inactive part in light blue */}
                        <div 
                          className="bg-sky-400 h-full" 
                          style={{ width: `${total > 0 ? ((registered - active) / total) * 100 : 0}%` }}
                          title={`${registered - active} jemaat terdaftar namun tidak aktif 30 hari terakhir`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 text-[10px] text-gray-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-sm"></span>
                  <span>Aktif (30 Hari)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-sky-400 rounded-sm"></span>
                  <span>Terdaftar (Inaktif)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-gray-200/70 rounded-sm"></span>
                  <span>Belum Terdaftar</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
