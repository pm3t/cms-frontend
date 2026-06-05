import React, { useState, useEffect } from 'react';
import { reportingService } from './reportingService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AttendanceReport() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip labelFormatter={(label) => `Ibadah: ${label}`} />
              <Line type="monotone" dataKey="attendance" name="Jumlah Hadir" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 mt-6">
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
    </div>
  );
}
