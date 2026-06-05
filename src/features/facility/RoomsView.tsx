import React, { useState } from 'react';
import { DoorOpen, Plus, Edit2, Trash2, X, Users, MapPin, Zap } from 'lucide-react';
import { facilityService } from './facilityService';
import type { Facility, FacilityType } from './facilityService';

const TYPES: { value: FacilityType; label: string; emoji: string }[] = [
  { value: 'SANCTUARY', label: 'Gedung Ibadah', emoji: '⛪' },
  { value: 'MEETING_ROOM', label: 'Ruang Rapat', emoji: '🪑' },
  { value: 'HALL', label: 'Aula / Serba Guna', emoji: '🏛️' },
  { value: 'OFFICE', label: 'Kantor', emoji: '🏢' },
  { value: 'KITCHEN', label: 'Dapur', emoji: '🍳' },
  { value: 'STORAGE', label: 'Gudang', emoji: '📦' },
  { value: 'OTHER', label: 'Lainnya', emoji: '🏗️' },
];
const emptyForm = { name: '', type: 'OTHER' as FacilityType, capacity: '', location: '', description: '', amenities: '', isActive: true };

interface Props { facilities: Facility[]; onRefresh: () => void; }

export default function RoomsView({ facilities, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Facility | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit = (f: Facility) => {
    setEditing(f);
    setForm({ name: f.name, type: f.type, capacity: String(f.capacity || ''), location: f.location || '', description: f.description || '', amenities: f.amenities || '', isActive: f.isActive });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, capacity: form.capacity ? Number(form.capacity) : undefined };
      if (editing) await facilityService.updateFacility(editing.id, payload);
      else await facilityService.createFacility(payload);
      setShowModal(false); onRefresh();
    } catch (err: any) { alert('Gagal: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Nonaktifkan fasilitas ini?')) return;
    try { await facilityService.deleteFacility(id); onRefresh(); }
    catch (err: any) { alert('Gagal: ' + err.message); }
  };

  const active = facilities.filter(f => f.isActive);
  const inactive = facilities.filter(f => !f.isActive);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Daftar Ruangan & Fasilitas</h2>
          <p className="text-sm text-gray-500">{active.length} fasilitas aktif</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-emerald-200 cursor-pointer">
          <Plus className="w-4 h-4" /> Tambah Ruangan
        </button>
      </div>

      {active.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <DoorOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-semibold text-lg text-gray-700 mb-1">Belum Ada Ruangan</p>
          <p className="text-sm text-gray-500 mb-4">Tambahkan ruangan atau fasilitas gereja untuk mulai mengelola reservasi.</p>
          <button onClick={openCreate} className="px-4 py-2 bg-emerald-50 text-emerald-600 font-bold text-sm rounded-xl inline-flex items-center gap-2 cursor-pointer hover:bg-emerald-100">
            <Plus className="w-4 h-4" /> Tambah Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {active.map(f => {
            const t = TYPES.find(t => t.value === f.type);
            return (
              <div key={f.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{t?.emoji}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{f.name}</h3>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{t?.label}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(f)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(f.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  {f.capacity && <div className="flex items-center gap-2 text-gray-500"><Users className="w-3.5 h-3.5" /> Kapasitas: <strong className="text-gray-800">{f.capacity} orang</strong></div>}
                  {f.location && <div className="flex items-center gap-2 text-gray-500"><MapPin className="w-3.5 h-3.5" /> {f.location}</div>}
                  {f.amenities && <div className="flex items-start gap-2 text-gray-500"><Zap className="w-3.5 h-3.5 mt-0.5 shrink-0" /><span className="text-xs">{f.amenities}</span></div>}
                </div>
                {f._count && (
                  <div className="mt-4 pt-3 border-t border-gray-50 flex gap-4 text-xs text-gray-400">
                    <span className="font-semibold">📅 {f._count.bookings} reservasi</span>
                    <span className="font-semibold">🔧 {f._count.maintenances} perawatan</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {inactive.length > 0 && (
        <div className="border border-gray-100 rounded-2xl p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{inactive.length} Fasilitas Nonaktif</p>
          <div className="flex flex-wrap gap-2">
            {inactive.map(f => (
              <span key={f.id} className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full font-semibold">{f.name}</span>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit Fasilitas' : 'Tambah Fasilitas'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-bold text-gray-700 block mb-1">Nama Fasilitas *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Contoh: Ruang Rapat Lantai 2" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Tipe *</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as FacilityType }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Kapasitas (orang)</label>
                  <input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="50" min="1" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-bold text-gray-700 block mb-1">Lokasi</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Lantai 2 Gedung A" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-bold text-gray-700 block mb-1">Fasilitas Tersedia (pisah koma)</label>
                  <input value={form.amenities} onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="AC, Proyektor, Sound System, Whiteboard" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-bold text-gray-700 block mb-1">Deskripsi</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 cursor-pointer">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl cursor-pointer">
                  {saving ? 'Menyimpan...' : (editing ? 'Simpan Perubahan' : 'Tambah Fasilitas')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
