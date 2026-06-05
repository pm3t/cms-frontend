import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, DollarSign, CalendarCheck, Calendar, HeartHandshake,
  BookOpen, Building2, BarChart3, Megaphone, ChevronRight,
  TrendingUp, TrendingDown, Minus, Activity, Church
} from 'lucide-react';
import api from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  link: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
}

export default function DashboardHome() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    upcomingEvents: 0,
    attendanceToday: 0,
    totalGroups: 0,
    openPrayers: 0,
    recentMembers: [] as any[],
    recentTransactions: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 17) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [membersRes, financeRes, eventsRes, groupsRes] = await Promise.allSettled([
          api.get('/members'),
          api.get('/finance/summary'),
          api.get('/events'),
          api.get('/small-groups'),
        ]);

        const members = membersRes.status === 'fulfilled' ? membersRes.value.data : [];
        const finance = financeRes.status === 'fulfilled' ? financeRes.value.data : null;
        const events = eventsRes.status === 'fulfilled' ? eventsRes.value.data : [];
        const groups = groupsRes.status === 'fulfilled' ? groupsRes.value.data : [];

        const now = new Date();
        const upcoming = Array.isArray(events)
          ? events.filter((e: any) => new Date(e.startDate) >= now).length
          : 0;

        const recentMembers = Array.isArray(members)
          ? [...members].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
          : [];

        setStats({
          totalMembers: Array.isArray(members) ? members.length : 0,
          activeMembers: Array.isArray(members) ? members.filter((m: any) => m.status === 'ACTIVE').length : 0,
          totalIncome: finance?.totalIncome ?? 0,
          totalExpense: finance?.totalExpense ?? 0,
          netBalance: finance?.netBalance ?? 0,
          upcomingEvents: upcoming,
          attendanceToday: 0,
          totalGroups: Array.isArray(groups) ? groups.length : 0,
          openPrayers: 0,
          recentMembers,
          recentTransactions: [],
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatRp = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const statCards: StatCard[] = [
    {
      label: 'Total Jemaat',
      value: loading ? '...' : stats.totalMembers,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: '/members',
      trend: 'up',
      trendLabel: `${stats.activeMembers} aktif`,
    },
    {
      label: 'Kas Bersih',
      value: loading ? '...' : formatRp(stats.netBalance),
      icon: DollarSign,
      color: stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600',
      bg: stats.netBalance >= 0 ? 'bg-green-50' : 'bg-red-50',
      link: '/finance',
      trend: stats.netBalance >= 0 ? 'up' : 'down',
      trendLabel: `Keluar: ${formatRp(stats.totalExpense)}`,
    },
    {
      label: 'Acara Mendatang',
      value: loading ? '...' : stats.upcomingEvents,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      link: '/events',
      trend: 'neutral',
      trendLabel: 'acara aktif',
    },
    {
      label: 'Kelompok Sel',
      value: loading ? '...' : stats.totalGroups,
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      link: '/small-groups',
      trend: 'neutral',
      trendLabel: 'kelompok aktif',
    },
  ];

  const quickLinks = [
    { label: 'Kehadiran', icon: CalendarCheck, to: '/attendance', color: 'bg-sky-500' },
    { label: 'Pastoral Care', icon: HeartHandshake, to: '/pastoral', color: 'bg-rose-500' },
    { label: 'Dokumen', icon: BookOpen, to: '/documents', color: 'bg-amber-500' },
    { label: 'Fasilitas', icon: Building2, to: '/facility', color: 'bg-teal-500' },
    { label: 'Laporan', icon: BarChart3, to: '/reports', color: 'bg-indigo-500' },
    { label: 'Komunikasi', icon: Megaphone, to: '/communication', color: 'bg-pink-500' },
    { label: 'Pelayanan', icon: Church, to: '/ministry', color: 'bg-violet-500' },
    { label: 'Digital', icon: Activity, to: '/digital', color: 'bg-emerald-500' },
  ];

  const categoryColors: Record<string, string> = {
    ADULT: 'bg-blue-100 text-blue-700',
    YOUTH: 'bg-green-100 text-green-700',
    CHILDREN: 'bg-yellow-100 text-yellow-700',
    ELDERLY: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-8">
      {/* Hero Greeting Banner */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold">
              {greeting()}, {user?.name?.split(' ')[0] ?? 'Admin'} 👋
            </h1>
            <p className="mt-2 text-blue-100 text-sm md:text-base max-w-xl">
              Selamat datang di dasbor Eklesia CMS. Berikut ringkasan aktivitas gereja Anda hari ini.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/members"
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-white text-sm font-bold rounded-xl transition-all active:scale-95"
            >
              + Tambah Jemaat
            </Link>
            <Link
              to="/finance"
              className="px-4 py-2.5 bg-white text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-50 transition-all active:scale-95 shadow-lg"
            >
              Catat Transaksi
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.link}
              className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 mt-1 truncate">
                {card.value}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
              {card.trendLabel && (
                <div className="flex items-center gap-1 mt-3">
                  {card.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-green-500" />}
                  {card.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                  {card.trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-gray-400" />}
                  <span className="text-xs text-gray-500">{card.trendLabel}</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Members */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-gray-900">Jemaat Terbaru</h2>
              <p className="text-xs text-gray-500 mt-0.5">5 anggota terakhir didaftarkan</p>
            </div>
            <Link to="/members" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-50 rounded w-1/4" />
                  </div>
                </div>
              ))
            ) : stats.recentMembers.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">Belum ada jemaat terdaftar</p>
              </div>
            ) : (
              stats.recentMembers.map((m: any) => (
                <Link
                  key={m.id}
                  to={`/members/${m.id}`}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-blue-50/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {m.firstName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm truncate">
                      {m.firstName} {m.lastName || ''}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{m.email || 'Tidak ada email'}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${categoryColors[m.category] || 'bg-gray-100 text-gray-500'}`}>
                      {m.category}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${m.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {m.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Finance Summary */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-gray-900">Ringkasan Keuangan</h2>
              <p className="text-xs text-gray-500 mt-0.5">Bulan ini</p>
            </div>
            <Link to="/finance" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
              Detail <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-6 space-y-5">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-50 rounded-xl" />
                ))}
              </div>
            ) : (
              <>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Total Pemasukan</p>
                  <p className="text-xl font-extrabold text-green-700">{formatRp(stats.totalIncome)}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Total Pengeluaran</p>
                  <p className="text-xl font-extrabold text-red-600">{formatRp(stats.totalExpense)}</p>
                </div>
                <div className={`p-4 rounded-xl border ${stats.netBalance >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${stats.netBalance >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
                    Kas Bersih
                  </p>
                  <p className={`text-xl font-extrabold ${stats.netBalance >= 0 ? 'text-blue-700' : 'text-orange-600'}`}>
                    {formatRp(stats.netBalance)}
                  </p>
                </div>
                <Link
                  to="/finance"
                  className="w-full py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition active:scale-95"
                >
                  <DollarSign className="w-4 h-4" /> Buka Laporan Keuangan
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Akses Cepat Modul</h2>
          <p className="text-xs text-gray-500 mt-0.5">Navigasi ke semua fitur CMS Eklesia</p>
        </div>
        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center gap-2.5 p-3 rounded-2xl hover:bg-gray-50 transition-all group active:scale-95"
              >
                <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
