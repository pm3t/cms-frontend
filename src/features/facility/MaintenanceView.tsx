import React, { useState } from 'react';
import { Wrench, Plus, Trash2, Edit2, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { facilityService } from './facilityService';
import type { MaintenanceSchedule, MaintenanceStatus, MaintenanceFrequency, Facility, Equipment } from './facilityService';

const STATUS_CONFIG: Record<MaintenanceStatus, { label: string; color: string; dot: string }> = {
  PENDING: { label: 'Menunggu', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-400' },
  IN_PROGRESS: { label: 'Berjalan', color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-400' },
  COMPLETED: { label: 'Selesai', color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-400' },
  OVERDUE: { label: 'Terlambat!', color: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
  CANCELLED: { label: 'Dibatalkan', color: 'bg-gray-50 text-gray-500', dot: 'bg-gray-300' },
};

const FREQ_LABELS: Record<MaintenanceFrequency, string> = {
  ONE_TIME: 'Sekali', DAILY: 'Harian', WEEKLY: 'Mingguan',
  MONTHLY: 'Bulanan', QUARTERLY: 'Triwulan', YEARLY: 'Tahunan',
};

const MAINT_TYPES = ['ELECTRICAL', 'PLUMBING', 'HVAC', 'CLEANING', 'GENERAL', 'OTHER'];
const emptyForm = { title: '', description: '', type: 'GENERAL', frequency: 'ONE_TIME' as MaintenanceFrequency, status: 'PENDING' as MaintenanceStatus, facilityId: '', equipmentId: '', scheduledDate: '', completedDate: '', assignedTo: '', cost: '', notes: '' };

interface Props { maintenances: MaintenanceSchedule[]; facilities: Facility[]; equipments: Equipment[]; onRefresh: () => void; }

export default function MaintenanceView({ maintenances, facilities, equipments, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MaintenanceSchedule | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | ''>('');

  const filtered = maintenances.filter(m => !statusFilter || m.status === statusFilter);
  const overdue = maintenances.filter(m => m.status === 'OVERDUE');

  const openEdit = (m: MaintenanceSchedule) => {
    setEditing(m);
    setForm({ title: m.title, description: m.description || '', type: m.type, frequency: m.frequency, status: m.status, facilityId: m.facilityId || '', equipmentId: m.equipmentId || '', scheduledDate: m.scheduledDate.substring(0, 10), completedDate: m.completedDate ? m.completedDate.substring(0, 10) : '', assignedTo: m.assignedTo || '', cost: String(m.cost || ''), notes: m.notes || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, facilityId: form.facilityId || undefined, equipmentId: form.equipmentId || undefined, cost: form.cost ? Number(form.cost) : undefined };
      if (editing) await facilityService.updateMaintenance(editing.id, payload);
      else await facilityService.createMaintenance(payload);
      setShowModal(false); setEditing(null); setForm({ ...emptyForm }); onRefresh();
    } catch (err: any) { alert('Gagal: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleComplete = async (m: MaintenanceSchedule) => {
    try {
      await facilityService.updateMaintenance(m.id, { status: 'COMPLETED', completedDate: new Date().toISOString().substring(0, 10) });
      onRefresh();
    } catch (err: any) { alert('Gagal: ' + err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jadwal maintenance ini?')) return;
    try { await facilityService.deleteMaintenance(id); onRefresh(); }
    catch (err: any) { alert('Gagal: ' + err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Jadwal Perawatan</h2>
          <p className="text-sm text-gray-500">{overdue.length > 0 ? <span className="text-red-600 font-bold">{overdue.length} item terlambat!</span> : `${maintenances.length} jadwal`}</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true); }} className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-orange-200 cursor-pointer">
          <Plus className="w-4 h-4" /> Buat Jadwal
        </button>
      </div>

      {/* Overdue Alert */}
      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800 text-sm">{overdue.length} Jadwal Terlambat!</p>
            <p className="text-xs text-red-700 mt-1">{overdue.map(m => m.title).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
          <option value="">Semua Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-semibold text-lg text-gray-700 mb-1">Belum Ada Jadwal Perawatan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(m => {
            const sc = STATUS_CONFIG[m.status];
            const isActive = ['PENDING', 'IN_PROGRESS', 'OVERDUE'].includes(m.status);
            return (
              <div key={m.id} className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group ${m.status === 'OVERDUE' ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${sc.dot}`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{m.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${sc.color}`}>{sc.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>📋 {m.type}</span>
                        <span>🔄 {FREQ_LABELS[m.frequency]}</span>
                        <span>📅 {new Date(m.scheduledDate).toLocaleDateString('id-ID')}</span>
                        {m.assignedTo && <span>👤 {m.assignedTo}</span>}
                        {m.facility && <span>🏛️ {m.facility.name}</span>}
                        {m.equipment && <span>🔧 {m.equipment.name}</span>}
                        {m.cost && <span>💰 Rp {m.cost.toLocaleString('id-ID')}</span>}
                      </div>
                      {m.notes && <p className="text-xs text-gray-400 mt-2">{m.notes}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {isActive && (
                      <button onClick={() => handleComplete(m)} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer">
                        <CheckCircle className="w-3.5 h-3.5" /> Selesai
                      </button>
                    )}
                    <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl cursor-pointer opacity-0 group-hover:opacity-100"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl cursor-pointer opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit Jadwal' : 'Buat Jadwal Perawatan'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="text-sm font-bold text-gray-700 block mb-1">Judul *</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Tipe</label><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">{MAINT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Frekuensi</label><select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value as MaintenanceFrequency }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">{Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Status</label><select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as MaintenanceStatus }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">{Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Tgl Jadwal *</label><input type="date" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Ruangan (opsional)</label><select value={form.facilityId} onChange={e => setForm(f => ({ ...f, facilityId: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"><option value="">—</option>{facilities.filter(f => f.isActive).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Peralatan (opsional)</label><select value={form.equipmentId} onChange={e => setForm(f => ({ ...f, equipmentId: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"><option value="">—</option>{equipments.filter(e => e.isActive).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Penanggung Jawab</label><input value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Estimasi Biaya (Rp)</label><input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              </div>
              <div><label className="text-sm font-bold text-gray-700 block mb-1">Catatan</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 cursor-pointer">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-sm rounded-xl cursor-pointer">{saving ? 'Menyimpan...' : (editing ? 'Simpan' : 'Buat Jadwal')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
