import React, { useState } from 'react';
import { PieChart, LineChart, BarChart as BarChartIcon, Settings2, Download, Activity } from 'lucide-react';
import OverviewView from './OverviewView';
import AnalyticsView from './AnalyticsView';
import MembershipReport from './MembershipReport';
import AttendanceReport from './AttendanceReport';
import FinancialReport from './FinancialReport';
import CustomReportBuilder from './CustomReportBuilder';

type TabId = 'OVERVIEW' | 'ANALYTICS' | 'MEMBERSHIP' | 'ATTENDANCE' | 'FINANCE' | 'CUSTOM';

export default function ReportingDashboard() {
  const [tab, setTab] = useState<TabId>('OVERVIEW');

  const tabs = [
    { id: 'OVERVIEW', name: 'Ringkasan', icon: PieChart },
    { id: 'ANALYTICS', name: 'Analitik Lanjut', icon: Activity },
    { id: 'MEMBERSHIP', name: 'Jemaat', icon: BarChartIcon },
    { id: 'ATTENDANCE', name: 'Kehadiran', icon: LineChart },
    { id: 'FINANCE', name: 'Keuangan', icon: PieChart },
    { id: 'CUSTOM', name: 'Custom Report', icon: Settings2 },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden print:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <BarChartIcon className="w-8 h-8 text-blue-200" />
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Laporan & Analitik</h1>
            </div>
            <p className="mt-2 text-blue-100 text-sm md:text-base max-w-2xl">
              Pantau pertumbuhan jemaat, tren kehadiran, arus kas keuangan, dan buat laporan kustom.
            </p>
          </div>
          <button onClick={handlePrint} className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white font-semibold text-sm rounded-xl backdrop-blur-md border border-white/20 cursor-pointer flex items-center gap-2">
            <Download className="w-4 h-4" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Header Khusus Print (Disembunyikan di layar biasa) */}
      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold border-b-2 border-black pb-2">Laporan & Analitik - GBI HOS</h1>
        <p className="text-sm text-gray-500 mt-2">Dicetak pada: {new Date().toLocaleDateString('id-ID')} {new Date().toLocaleTimeString('id-ID')}</p>
      </div>

      {/* Tabs - Disembunyikan saat print */}
      <div className="flex border-b border-gray-200 overflow-x-auto bg-white rounded-t-2xl px-2 shadow-sm border border-gray-100 print:hidden">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id as TabId)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              {t.name}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-b-2xl shadow-sm border border-t-0 border-gray-100 min-h-[500px] print:shadow-none print:border-none print:p-0">
        {tab === 'OVERVIEW' && <OverviewView />}
        {tab === 'ANALYTICS' && <AnalyticsView />}
        {tab === 'MEMBERSHIP' && <MembershipReport />}
        {tab === 'ATTENDANCE' && <AttendanceReport />}
        {tab === 'FINANCE' && <FinancialReport />}
        {tab === 'CUSTOM' && <CustomReportBuilder />}
      </div>
    </div>
  );
}
