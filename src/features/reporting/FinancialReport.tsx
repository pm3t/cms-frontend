import React, { useState, useEffect } from 'react';
import { reportingService } from './reportingService';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];

export default function FinancialReport() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        <h2 className="text-xl font-bold text-gray-900">Arus Kas & Keuangan</h2>
        <p className="text-sm text-gray-500">Pemasukan vs Pengeluaran 6 Bulan Terakhir</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Tren Pemasukan & Pengeluaran</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `Rp${(val/1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                <Legend />
                <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Distribusi Pengeluaran</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.expensesByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {stats.expensesByCategory.map((_: any, i: number) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
