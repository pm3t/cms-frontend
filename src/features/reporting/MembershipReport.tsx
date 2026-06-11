import React, { useState, useEffect } from 'react';
import { reportingService } from './reportingService';

const COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

interface DonutSlice {
  name: string;
  value: number;
}

function DonutChart({ data, size = 200 }: { data: DonutSlice[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
        <svg className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        <p className="text-xs font-medium">Belum ada data</p>
      </div>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const ri = r * 0.55;
  let startAngle = -Math.PI / 2;
  const gap = 0.04; // gap between slices in radians

  const slices = data.filter(d => d.value > 0).map((d, i) => {
    const angle = Math.max(0, (d.value / total) * 2 * Math.PI - gap);
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + ri * Math.cos(endAngle);
    const iy1 = cy + ri * Math.sin(endAngle);
    const ix2 = cx + ri * Math.cos(startAngle);
    const iy2 = cy + ri * Math.sin(startAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ri} ${ri} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
    const fill = COLORS[i % COLORS.length];
    startAngle = endAngle + gap;
    return { path, fill, name: d.name, value: d.value };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.fill} />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={22} fontWeight="bold" fill="#111827">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill="#6b7280">total</text>
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.fill }} />
            <span className="text-xs text-gray-600">{s.name} ({s.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MembershipReport() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportingService.getMembershipStats()
      .then(s => setStats(s))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat laporan jemaat...</div>;
  if (!stats) return null;

  const genderData: DonutSlice[] = [
    { name: 'Laki-laki', value: stats.genderStats?.MALE ?? 0 },
    { name: 'Perempuan', value: stats.genderStats?.FEMALE ?? 0 },
  ];

  const ageData: DonutSlice[] = Object.entries(stats.ageGroups ?? {})
    .map(([name, value]) => ({ name, value: value as number }))
    .filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Demografi Jemaat</h2>
        <p className="text-sm text-gray-500">Total {stats.total} jemaat terdaftar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide text-center mb-6">Distribusi Gender</h3>
          <DonutChart data={genderData} size={200} />
        </div>

        <div className="border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide text-center mb-6">Kelompok Usia</h3>
          <DonutChart data={ageData} size={200} />
        </div>
      </div>
    </div>
  );
}
