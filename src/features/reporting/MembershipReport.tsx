import React, { useState, useEffect } from 'react';
import { reportingService } from './reportingService';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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

  const genderData = [
    { name: 'Laki-laki', value: stats.genderStats.MALE },
    { name: 'Perempuan', value: stats.genderStats.FEMALE }
  ];

  const ageData = Object.entries(stats.ageGroups).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Demografi Jemaat</h2>
        <p className="text-sm text-gray-500">Total {stats.total} jemaat terdaftar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide text-center mb-4">Distribusi Gender</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {genderData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide text-center mb-4">Kelompok Usia</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ageData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {ageData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
