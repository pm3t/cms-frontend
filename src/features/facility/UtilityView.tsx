import React, { useState } from 'react';
import { Zap, Plus, Trash2, Edit2, X, CheckCircle } from 'lucide-react';
import { facilityService } from './facilityService';
import type { UtilityRecord, UtilityType } from './facilityService';

const UTILITY_CONFIG: Record<UtilityType, { label: string; icon: string; unit: string; color: string }> = {
  ELECTRICITY: { label: 'Listrik', icon: '⚡', unit: 'kWh', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  WATER: { label: 'Air', icon: '💧', unit: 'm³', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  INTERNET: { label: 'Internet', icon: '🌐', unit: 'Mbps', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  GAS: { label: 'Gas', icon: '🔥', unit: 'm³', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  OTHER: { label: 'Lainnya', icon: '📊', unit: '-', color: 'bg-gray-50 text-gray-700 border-gray-200' },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const emptyForm = { type: 'ELECTRICITY' as UtilityType, month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), amount: '', usage: '', unit: 'kWh', vendor: '', invoiceNumber: '', isPaid: false, notes: '' };

interface Props { utilities: UtilityRecord[]; onRefresh: () => void; }

export default function UtilityView({ utilities, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<UtilityRecord | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [typeFilter, setTypeFilter] = useState<UtilityType | ''>('');
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));

  const filtered = utilities.filter(u => {
    const matchType = !typeFilter || u.type === typeFilter;
    const matchYear = !yearFilter || u.year === Number(yearFilter);
    return matchType && matchYear;
  });

  // Summary: total per type for the filtered year
  const summary = Object.keys(UTILITY_CONFIG).map(type => {
    const recs = filtered.filter(u => u.type === type);
    const total = recs.reduce((s, r) => s + r.amount, 0);
    const unpaid = recs.filter(r => !r.isPaid).reduce((s, r) => s + r.amount, 0);
    return { type: type as UtilityType, total, unpaid, count: recs.length };
  }).filter(s => s.count > 0);

  const openEdit = (r: UtilityRecord) => {
    setEditing(r);
    setForm({ type: r.type, month: String(r.month), year: String(r.year), amount: String(r.amount), usage: String(r.usage || ''), unit: r.unit || '', vendor: r.vendor || '', invoiceNumber: r.invoiceNumber || '', isPaid: r.isPaid, notes: r.notes || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount), usage: form.usage ? Number(form.usage) : undefined, month: Number(form.month), year: Number(form.year) };
      if (editing) await facilityService.updateUtility(editing.id, payload);
      else await facilityService.createUtility(payload);
      setShowModal(false); setEditing(null); setForm({ ...emptyForm }); onRefresh();
    } catch (err: any) { alert('Gagal: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleTogglePaid = async (r: UtilityRecord) => {
    try { await facilityService.updateUtility(r.id, { isPaid: !r.isPaid }); onRefresh(); }
    catch (err: any) { alert('Gagal: ' + err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus rekam utilitas ini?')) return;
    try { await facilityService.deleteUtility(id); onRefresh(); }
    catch (err: any) { alert('Gagal: ' + err.message); }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manajemen Utilitas</h2>
          <p className="text-sm text-gray-500">Listrik, Air, Internet, Gas — Tagihan & pembayaran bulanan</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true); }} className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-yellow-200 cursor-pointer">
          <Plus className="w-4 h-4" /> Catat Tagihan
        </button>
      </div>

      {/* Summary cards */}
      {summary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summary.map(s => {
            const cfg = UTILITY_CONFIG[s.type];
            return (
              <div key={s.type} className={`border rounded-2xl p-4 ${cfg.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{cfg.icon}</span>
                  <span className="font-bold text-sm">{cfg.label}</span>
                </div>
                <p className="text-lg font-extrabold">Rp {s.total.toLocaleString('id-ID')}</p>
                {s.unpaid > 0 && <p className="text-xs font-bold mt-1 text-red-600">Belum lunas: Rp {s.unpaid.toLocaleString('id-ID')}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">
          {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">
          <option value="">Semua Jenis</option>
          {Object.entries(UTILITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-semibold text-lg text-gray-700 mb-1">Belum Ada Rekam Tagihan</p>
          <p className="text-sm text-gray-500 mb-4">Catat tagihan listrik, air, dan utilitas lainnya.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Jenis', 'Bulan / Tahun', 'Jumlah', 'Pemakaian', 'Vendor', 'No. Invoice', 'Status', 'Aksi'].map(h => <th key={h} className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(r => {
                const cfg = UTILITY_CONFIG[r.type];
                return (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 text-xs font-bold rounded-lg border ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-700">{MONTHS[r.month - 1]} {r.year}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">Rp {r.amount.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-gray-500">{r.usage ? `${r.usage} ${r.unit || ''}` : '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{r.vendor || '-'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{r.invoiceNumber || '-'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleTogglePaid(r)} className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${r.isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}>
                        {r.isPaid ? <><CheckCircle className="w-3 h-3" /> Lunas</> : '⚠️ Belum Lunas'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit Tagihan' : 'Catat Tagihan Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="text-sm font-bold text-gray-700 block mb-1">Jenis Utilitas *</label><select value={form.type} onChange={e => { const cfg = UTILITY_CONFIG[e.target.value as UtilityType]; setForm(f => ({ ...f, type: e.target.value as UtilityType, unit: cfg.unit })); }} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">{Object.entries(UTILITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</select></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Bulan *</label><select value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">{MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}</select></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Tahun *</label><select value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Total Tagihan (Rp) *</label><input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" /></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Pemakaian</label><div className="flex gap-2"><input type="number" value={form.usage} onChange={e => setForm(f => ({ ...f, usage: e.target.value }))} className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" /><input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="w-16 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="kWh" /></div></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">Vendor / Provider</label><input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" /></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1">No. Invoice</label><input value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" /></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <input id="paid" type="checkbox" checked={form.isPaid} onChange={e => setForm(f => ({ ...f, isPaid: e.target.checked }))} className="w-4 h-4 accent-emerald-600" />
                <label htmlFor="paid" className="text-sm font-semibold text-gray-700 cursor-pointer">Sudah dibayar / dilunasi</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 cursor-pointer">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white font-bold text-sm rounded-xl cursor-pointer">{saving ? 'Menyimpan...' : (editing ? 'Simpan' : 'Catat Tagihan')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
