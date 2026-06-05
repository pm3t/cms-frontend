import React, { useState, useEffect } from 'react';
import { Building2, DoorOpen, Calendar, Wrench, Zap } from 'lucide-react';
import { facilityService } from './facilityService';
import type { Facility, FacilityBooking, Equipment, MaintenanceSchedule, UtilityRecord } from './facilityService';
import RoomsView from './RoomsView';
import BookingsView from './BookingsView';
import EquipmentView from './EquipmentView';
import MaintenanceView from './MaintenanceView';
import UtilityView from './UtilityView';

type TabId = 'ROOMS' | 'BOOKINGS' | 'EQUIPMENT' | 'MAINTENANCE' | 'UTILITIES';

export default function FacilityDashboard() {
  const [tab, setTab] = useState<TabId>('ROOMS');
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceSchedule[]>([]);
  const [utilities, setUtilities] = useState<UtilityRecord[]>([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [f, b, e, m, u] = await Promise.all([
        facilityService.getFacilities(),
        facilityService.getBookings(),
        facilityService.getEquipments(),
        facilityService.getMaintenances(),
        facilityService.getUtilities({ year: new Date().getFullYear() }),
      ]);
      setFacilities(f); setBookings(b); setEquipments(e);
      setMaintenances(m); setUtilities(u);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const overdue = maintenances.filter(m => m.status === 'OVERDUE').length;
  const pending = bookings.filter(b => b.status === 'PENDING').length;
  const unpaid = utilities.filter(u => !u.isPaid).length;

  const tabs = [
    { id: 'ROOMS', name: 'Ruangan', icon: DoorOpen, color: 'text-blue-500', count: facilities.length },
    { id: 'BOOKINGS', name: 'Reservasi', icon: Calendar, color: 'text-emerald-500', count: pending || undefined, countLabel: 'pending' },
    { id: 'EQUIPMENT', name: 'Inventaris', icon: Wrench, color: 'text-purple-500', count: equipments.length },
    { id: 'MAINTENANCE', name: 'Perawatan', icon: Wrench, color: 'text-orange-500', count: overdue || undefined, countLabel: 'overdue' },
    { id: 'UTILITIES', name: 'Utilitas', icon: Zap, color: 'text-yellow-500', count: unpaid || undefined, countLabel: 'belum lunas' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-emerald-200" />
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Manajemen Fasilitas</h1>
            </div>
            <p className="mt-2 text-emerald-100 text-sm md:text-base max-w-2xl">
              Kelola ruangan gereja, reservasi, inventaris peralatan, jadwal perawatan, dan tagihan utilitas.
            </p>
          </div>
          <button onClick={fetchAll} className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white font-semibold text-sm rounded-xl backdrop-blur-md border border-white/20 cursor-pointer">
            Refresh Data
          </button>
        </div>
        {/* Stats */}
        <div className="relative z-10 mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Ruangan', value: facilities.filter(f => f.isActive).length, icon: '🏛️' },
            { label: 'Reservasi Pending', value: pending, icon: '📅', alert: pending > 0 },
            { label: 'Inventaris', value: equipments.filter(e => e.isActive).length, icon: '🔧' },
            { label: 'Maintenance Overdue', value: overdue, icon: '⚠️', alert: overdue > 0 },
            { label: 'Tagihan Belum Lunas', value: unpaid, icon: '⚡', alert: unpaid > 0 },
          ].map(s => (
            <div key={s.label} className={`backdrop-blur-sm rounded-xl p-3 text-center border ${s.alert ? 'bg-red-500/20 border-red-300/30' : 'bg-white/10 border-white/10'}`}>
              <p className="text-lg">{s.icon}</p>
              <p className="text-xl font-extrabold">{s.value}</p>
              <p className="text-xs text-emerald-100 font-semibold leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto bg-white rounded-t-2xl px-2 shadow-sm border border-gray-100">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id as TabId)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${isActive ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : t.color}`} />
              {t.name}
              {t.count !== undefined && t.count > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-b-2xl shadow-sm border border-t-0 border-gray-100 min-h-[500px]">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm font-medium">Memuat data fasilitas...</p>
          </div>
        ) : (
          <>
            {tab === 'ROOMS' && <RoomsView facilities={facilities} onRefresh={fetchAll} />}
            {tab === 'BOOKINGS' && <BookingsView bookings={bookings} facilities={facilities} onRefresh={fetchAll} />}
            {tab === 'EQUIPMENT' && <EquipmentView equipments={equipments} onRefresh={fetchAll} />}
            {tab === 'MAINTENANCE' && <MaintenanceView maintenances={maintenances} facilities={facilities} equipments={equipments} onRefresh={fetchAll} />}
            {tab === 'UTILITIES' && <UtilityView utilities={utilities} onRefresh={fetchAll} />}
          </>
        )}
      </div>
    </div>
  );
}
