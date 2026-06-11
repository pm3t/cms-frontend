import React, { useState, useEffect } from 'react';
import { reportingService } from './reportingService';
import { useChartSize } from './useChartSize';

interface TrendPoint { name: string; date: string; attendance: number; }

function SVGLineChart({ data, width, height }: { data: TrendPoint[]; width: number; height: number }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
        <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm font-medium">Belum ada data kehadiran</p>
        <p className="text-xs">Mulai catat absensi ibadah untuk melihat tren di sini</p>
      </div>
    );
  }

  const pad = { top: 20, right: 20, bottom: 40, left: 40 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const maxVal = Math.max(...data.map(d => d.attendance), 1);
  const step = data.length > 1 ? w / (data.length - 1) : w;
  
  const points = data.map((d, i) => ({
    x: data.length > 1 ? i * step : w / 2,
    y: h - (d.attendance / maxVal) * h,
    ...d
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const ticks = 4;

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${pad.left},${pad.top})`}>
        {/* Grid lines */}
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const y = h * (i / ticks);
          const val = Math.round(maxVal * (1 - i / ticks));
          return (
            <g key={i}>
              <line x1={0} y1={y} x2={w} y2={y} stroke="#f3f4f6" strokeWidth={1} />
              <text x={-6} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{val}</text>
            </g>
          );
        })}

        {/* Line */}
        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Area fill */}
        <path
          d={`${pathD} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`}
          fill="url(#areaGrad)"
          opacity={0.15}
        />

        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={5} fill="white" stroke="#3b82f6" strokeWidth={2.5} />
        ))}

        {/* X labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={h + 16} textAnchor="middle" fontSize={10} fill="#6b7280">{p.name}</text>
        ))}

        {/* X axis */}
        <line x1={0} y1={h} x2={w} y2={h} stroke="#e5e7eb" strokeWidth={1} />
      </g>
    </svg>
  );
}

export default function AttendanceReport() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { ref, width, height } = useChartSize(320);

  useEffect(() => {
    reportingService.getAttendanceStats()
      .then(s => setStats(s))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat laporan kehadiran...</div>;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Tren Kehadiran Ibadah</h2>
        <p className="text-sm text-gray-500">6 Bulan Terakhir</p>
      </div>

      <div className="border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div ref={ref} className="h-80 w-full">
          <SVGLineChart data={stats.trend || []} width={width} height={height} />
        </div>
      </div>

      {stats.trend && stats.trend.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Tanggal</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Nama Ibadah</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Total Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.trend.map((s: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">{new Date(s.date).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3 font-semibold">{s.name}</td>
                  <td className="px-4 py-3 font-bold text-blue-600">{s.attendance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
