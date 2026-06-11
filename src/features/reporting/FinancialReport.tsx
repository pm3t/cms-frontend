import React, { useState, useEffect } from 'react';
import { reportingService } from './reportingService';
import { useChartSize } from './useChartSize';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];

interface BarData {
  month: string;
  income: number;
  expense: number;
}

function SVGBarChart({ data, width, height }: { data: BarData[]; width: number; height: number }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Belum ada data keuangan</div>;
  }

  const padding = { top: 20, right: 10, bottom: 40, left: 70 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);
  const groupW = chartW / data.length;
  const barW = Math.min((groupW * 0.35), 30);
  const gap = barW * 0.5;

  const fmt = (v: number) => v >= 1_000_000 ? `Rp${(v/1_000_000).toFixed(0)}M` : `Rp${(v/1000).toFixed(0)}K`;
  const yTicks = 4;

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${padding.left},${padding.top})`}>
        {/* Y Axis gridlines & labels */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const val = (maxVal / yTicks) * (yTicks - i);
          const y = chartH * (i / yTicks);
          return (
            <g key={i}>
              <line x1={0} y1={y} x2={chartW} y2={y} stroke="#f3f4f6" strokeWidth={1} />
              <text x={-6} y={y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{fmt(val)}</text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const cx = groupW * i + groupW / 2;
          const incH = (d.income / maxVal) * chartH;
          const expH = (d.expense / maxVal) * chartH;
          return (
            <g key={i}>
              {/* Income bar */}
              <rect
                x={cx - gap / 2 - barW}
                y={chartH - incH}
                width={barW}
                height={incH}
                fill="#10b981"
                rx={3}
              />
              {/* Expense bar */}
              <rect
                x={cx + gap / 2}
                y={chartH - expH}
                width={barW}
                height={expH}
                fill="#ef4444"
                rx={3}
              />
              {/* X label */}
              <text x={cx} y={chartH + 16} textAnchor="middle" fontSize={11} fill="#6b7280">{d.month}</text>
            </g>
          );
        })}

        {/* X Axis line */}
        <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke="#e5e7eb" strokeWidth={1} />
      </g>

      {/* Legend */}
      <g transform={`translate(${padding.left},${height - 10})`}>
        <rect x={0} y={0} width={10} height={10} fill="#10b981" rx={2} />
        <text x={14} y={9} fontSize={10} fill="#6b7280">Pemasukan</text>
        <rect x={80} y={0} width={10} height={10} fill="#ef4444" rx={2} />
        <text x={94} y={9} fontSize={10} fill="#6b7280">Pengeluaran</text>
      </g>
    </svg>
  );
}

interface DonutData {
  name: string;
  value: number;
}

function SVGDonut({ data, width, height }: { data: DonutData[]; width: number; height: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Tidak ada data</div>;

  const cx = width / 2;
  const cy = height / 2 - 10;
  const r = Math.min(cx, cy) * 0.7;
  const ri = r * 0.55;
  const gap = 0.05;
  let start = -Math.PI / 2;

  return (
    <svg width={width} height={height}>
      {data.filter(d => d.value > 0).map((d, i) => {
        const angle = Math.max(0, (d.value / total) * 2 * Math.PI - gap);
        const end = start + angle;
        const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
        const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
        const ix1 = cx + ri * Math.cos(end), iy1 = cy + ri * Math.sin(end);
        const ix2 = cx + ri * Math.cos(start), iy2 = cy + ri * Math.sin(start);
        const la = angle > Math.PI ? 1 : 0;
        const path = `M ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ri} ${ri} 0 ${la} 0 ${ix2} ${iy2} Z`;
        const fill = COLORS[i % COLORS.length];
        start = end + gap;
        return <path key={i} d={path} fill={fill} />;
      })}
      {/* Legend */}
      {data.filter(d => d.value > 0).map((d, i) => (
        <g key={i} transform={`translate(${i * (width / data.filter(dd => dd.value > 0).length)}, ${height - 16})`}>
          <rect width={8} height={8} fill={COLORS[i % COLORS.length]} rx={2} />
          <text x={12} y={8} fontSize={9} fill="#6b7280">{d.name}: {d.value}</text>
        </g>
      ))}
    </svg>
  );
}

export default function FinancialReport() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { ref: barRef, width: barWidth, height: barHeight } = useChartSize(300);
  const { ref: pieRef, width: pieWidth, height: pieHeight } = useChartSize(200);

  useEffect(() => {
    reportingService.getFinancialStats()
      .then(s => setStats(s))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat laporan keuangan...</div>;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Arus Kas &amp; Keuangan</h2>
        <p className="text-sm text-gray-500">Pemasukan vs Pengeluaran 6 Bulan Terakhir</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Tren Pemasukan &amp; Pengeluaran</h3>
          <div ref={barRef} className="h-72 w-full">
            <SVGBarChart data={stats.trend} width={barWidth} height={barHeight} />
          </div>
        </div>

        <div className="border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Distribusi Pengeluaran</h3>
          <div ref={pieRef} className="h-64 w-full">
            <SVGDonut data={stats.expensesByCategory || []} width={pieWidth} height={pieHeight} />
          </div>
        </div>
      </div>
    </div>
  );
}
