import React, { useState } from 'react';
import { Wrench, Plus, Trash2, Edit2, X, ClipboardList } from 'lucide-react';
import { facilityService } from './facilityService';
import type { Equipment, EquipmentCondition, EquipmentLogAction } from './facilityService';

const CONDITIONS: { value: EquipmentCondition; label: string; color: string }[] = [
  { value: 'EXCELLENT', label: 'Sempurna', color: 'bg-emerald-50 text-emerald-700' },
  { value: 'GOOD', label: 'Baik', color: 'bg-blue-50 text-blue-700' },
  { value: 'FAIR', label: 'Cukup', color: 'bg-amber-50 text-amber-700' },
  { value: 'POOR', label: 'Buruk', color: 'bg-orange-50 text-orange-700' },
  { value: 'OUT_OF_SERVICE', label: 'Rusak', color: 'bg-red-50 text-red-700' },
];
const LOG_ACTIONS: { value: EquipmentLogAction; label: string }[] = [
  { value: 'CHECKED_OUT', label: 'Dipinjam' },
  { value: 'RETURNED', label: 'Dikembalikan' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'REPAIR', label: 'Diperbaiki' },
  { value: 'INSPECTION', label: 'Inspeksi' },
];

const emptyForm = { name: '', category: '', serialNumber: '', purchaseDate: '', purchasePrice: '', condition: 'GOOD' as EquipmentCondition, location: '', description: '', nextMaintenanceDate: '' };

interface Props { equipments: Equipment[]; onRefresh: () => void; }

export default function EquipmentView({ equipments, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState<Equipment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<any | null>(null);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [logForm, setLogForm] = useState({ action: 'INSPECTION' as EquipmentLogAction, performedBy: '', notes: '', date: '' });
  const [saving, setSaving] = useState(false);
  const [condFilter, setCondFilter] = useState<EquipmentCondition | ''>('');
  const [search, setSearch] = useState('');

  const filtered = equipments.filter(e => {
    const matchCond = !condFilter || e.condition === condFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
    return matchCond && matchSearch && e.isActive;
  });

  const openEdit = (e: Equipment) => { setEditing(e); setForm({ name: e.name, category: e.category, serialNumber: e.serialNumber || '', purchaseDate: e.purchaseDate ? e.purchaseDate.substring(0, 10) : '', purchasePrice: String(e.purchasePrice || ''), condition: e.condition, location: e.location || '', description: e.description || '', nextMaintenanceDate: e.nextMaintenanceDate ? e.nextMaintenanceDate.substring(0, 10) : '' }); setShowModal(true); };

  const openDetail = async (e: Equipment) => {
    try { const d = await facilityService.getEquipmentById(e.id); setShowDetailModal(d); }
    catch (err: any) { alert(err.message); }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined };
      if (editing) await facilityService.updateEquipment(editing.id, payload);
      else await facilityService.createEquipment(payload);
      setShowModal(false); setEditing(null); setForm({ ...emptyForm }); onRefresh();
    } catch (err: any) { alert('Gagal: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleLog = async (ev: React.FormEvent) => {
    ev.preventDefault(); if (!showLogModal) return; setSaving(true);
    try {
      await facilityService.addEquipmentLog(showLogModal.id, logForm);
      setShowLogModal(null); setLogForm({ action: 'INSPECTION', performedBy: '', notes: '', date: '' }); onRefresh();
    } catch (err: any) { alert('Gagal: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Nonaktifkan peralatan ini?')) return;
    try { await facilityService.deleteEquipment(id); onRefresh(); }
    catch (err: any) { alert('Gagal: ' + err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Inventaris Peralatan</h2>
          <p className="text-sm text-gray-500">{equipments.filter(e => e.isActive).length} peralatan aktif</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true); }} className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-purple-200 cursor-pointer">
          <Plus className="w-4 h-4" /> Tambah Peralatan
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, kategori..." className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        <select value={condFilter} onChange={e => setCondFilter(e.target.value as any)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="">Semua Kondisi</option>
          {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-semibold text-lg text-gray-700 mb-1">Belum Ada Peralatan</p>
          <p className="text-sm text-gray-500">Tambahkan inventaris peralatan gereja.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Nama Peralatan', 'Kategori', 'Kondisi', 'Lokasi', 'S/N', 'Berikutnya', 'Aksi'].map(h => <th key={h} className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(e => {
                const cond = CONDITIONS.find(c => c.value === e.condition);
                return (
                  <tr key={e.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-4"><p className="font-semibold text-gray-900">{e.name}</p></td>
                    <td className="px-4 py-4"><span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-lg font-semibold">{e.category}</span></td>
                    <td className="px-4 py-4"><span className={`text-xs px-2 py-1 rounded-lg font-bold ${cond?.color}`}>{cond?.label}</span></td>
                    <td className="px-4 py-4 text-gray-500">{e.location || '-'}</td>
                    <td className="px-4 py-4 font-mono text-xs text-gray-400">{e.serialNumber || '-'}</td>
                    <td className="px-4 py-4 text-xs text-gray-500">{e.nextMaintenanceDate ? new Date(e.nextMaintenanceDate).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openDetail(e)} className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg cursor-pointer" title="Detail & Log"><ClipboardList className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setShowLogModal(e)} className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg cursor-pointer" title="Catat Log"><Plus className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openEdit(e)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(e.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit Peralatan' : 'Tambah Peralatan'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="text-sm font-bold text-gray-700 block mb-1">Nama Peralatan *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Sound System, Proyektor, dll" /></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Kategori *</label><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Audio, Lighting, Furniture" /></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Kondisi</label><select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value as EquipmentCondition }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">{CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">No. Seri</label><input value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Lokasi</label><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Tgl Beli</label><input type="date" value={form.purchaseDate} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Harga Beli (Rp)</label><input type="number" value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div className="col-span-2"><label className="text-sm font-bold text-gray-700 block mb-1">Tgl Maintenance Berikutnya</label><input type="date" value={form.nextMaintenanceDate} onChange={e => setForm(f => ({ ...f, nextMaintenanceDate: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 cursor-pointer">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl cursor-pointer">{saving ? 'Menyimpan...' : (editing ? 'Simpan' : 'Tambah')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowLogModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div><h3 className="text-lg font-bold text-gray-900">Catat Log</h3><p className="text-sm text-gray-500">{showLogModal.name}</p></div>
              <button onClick={() => setShowLogModal(null)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleLog} className="p-6 space-y-4">
              <div><label className="text-sm font-bold text-gray-700 block mb-1">Aksi *</label><select value={logForm.action} onChange={e => setLogForm(f => ({ ...f, action: e.target.value as EquipmentLogAction }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">{LOG_ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select></div>
              <div><label className="text-sm font-bold text-gray-700 block mb-1">Dilakukan Oleh *</label><input value={logForm.performedBy} onChange={e => setLogForm(f => ({ ...f, performedBy: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
              <div><label className="text-sm font-bold text-gray-700 block mb-1">Tanggal</label><input type="datetime-local" value={logForm.date} onChange={e => setLogForm(f => ({ ...f, date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
              <div><label className="text-sm font-bold text-gray-700 block mb-1">Catatan</label><textarea value={logForm.notes} onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" /></div>
              <div className="flex gap-3"><button type="button" onClick={() => setShowLogModal(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 cursor-pointer">Batal</button><button type="submit" disabled={saving} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl cursor-pointer">{saving ? 'Menyimpan...' : 'Catat Log'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{showDetailModal.name}</h3>
              <button onClick={() => setShowDetailModal(null)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Riwayat Log ({showDetailModal.logs?.length || 0})</p>
              {showDetailModal.logs?.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">Belum ada log</p> : (
                <div className="space-y-2">
                  {showDetailModal.logs?.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
                      <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-800">{LOG_ACTIONS.find(a => a.value === log.action)?.label}</span>
                          <span className="text-xs text-gray-400">{new Date(log.date).toLocaleDateString('id-ID')}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Oleh: {log.performedBy}</p>
                        {log.notes && <p className="text-xs text-gray-400 mt-1">{log.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
