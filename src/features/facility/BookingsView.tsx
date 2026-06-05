import React, { useState } from 'react';
import { Calendar, Plus, Trash2, CheckCircle, XCircle, X, Clock, AlertCircle } from 'lucide-react';
import { facilityService } from './facilityService';
import type { FacilityBooking, Facility, BookingStatus } from './facilityService';

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Menunggu', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="w-3 h-3" /> },
  APPROVED: { label: 'Disetujui', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> },
  REJECTED: { label: 'Ditolak', color: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle className="w-3 h-3" /> },
  CANCELLED: { label: 'Dibatalkan', color: 'bg-gray-50 text-gray-500 border-gray-200', icon: <X className="w-3 h-3" /> },
};

const emptyForm = { facilityId: '', requestedBy: '', purpose: '', description: '', startTime: '', endTime: '', notes: '' };

interface Props { bookings: FacilityBooking[]; facilities: Facility[]; onRefresh: () => void; }

export default function BookingsView({ bookings, facilities, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [facilityFilter, setFacilityFilter] = useState('');

  const filtered = bookings.filter(b => {
    const matchStatus = !statusFilter || b.status === statusFilter;
    const matchFacility = !facilityFilter || b.facilityId === facilityFilter;
    return matchStatus && matchFacility;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await facilityService.createBooking(form);
      setShowModal(false); setForm({ ...emptyForm }); onRefresh();
    } catch (err: any) { alert('Gagal: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleStatus = async (id: string, status: BookingStatus, approvedBy?: string) => {
    const labels: Record<string, string> = { APPROVED: 'menyetujui', REJECTED: 'menolak', CANCELLED: 'membatalkan' };
    if (!confirm(`Yakin ingin ${labels[status] || 'mengubah status'} reservasi ini?`)) return;
    try { await facilityService.updateBookingStatus(id, status, approvedBy); onRefresh(); }
    catch (err: any) { alert('Gagal: ' + err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus reservasi ini?')) return;
    try { await facilityService.deleteBooking(id); onRefresh(); }
    catch (err: any) { alert('Gagal: ' + err.message); }
  };

  const fmtDT = (s: string) => new Date(s).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const activeFacilities = facilities.filter(f => f.isActive);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reservasi Ruangan</h2>
          <p className="text-sm text-gray-500">{bookings.filter(b => b.status === 'PENDING').length} menunggu persetujuan</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-emerald-200 cursor-pointer">
          <Plus className="w-4 h-4" /> Buat Reservasi
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">Semua Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={facilityFilter} onChange={e => setFacilityFilter(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">Semua Ruangan</option>
          {activeFacilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-semibold text-lg text-gray-700 mb-1">Belum Ada Reservasi</p>
          <p className="text-sm text-gray-500">Belum ada reservasi yang cocok dengan filter Anda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => {
            const sc = STATUS_CONFIG[b.status];
            const isPending = b.status === 'PENDING';
            return (
              <div key={b.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border ${sc.color}`}>
                        {sc.icon} {sc.label}
                      </span>
                      <span className="font-bold text-gray-900">{b.facility?.name}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">📌 {b.purpose}</p>
                    <p className="text-sm text-gray-500 mb-1">👤 Diminta oleh: <strong>{b.requestedBy}</strong></p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mt-2">
                      <span>🕐 Mulai: {fmtDT(b.startTime)}</span>
                      <span>🕕 Selesai: {fmtDT(b.endTime)}</span>
                    </div>
                    {b.notes && <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">{b.notes}</p>}
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    {isPending && (
                      <>
                        <button onClick={() => handleStatus(b.id, 'APPROVED')} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" /> Setuju
                        </button>
                        <button onClick={() => handleStatus(b.id, 'REJECTED')} className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Tolak
                        </button>
                      </>
                    )}
                    {!['CANCELLED', 'REJECTED'].includes(b.status) && (
                      <button onClick={() => handleStatus(b.id, 'CANCELLED')} className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors">
                        <X className="w-3.5 h-3.5" /> Batalkan
                      </button>
                    )}
                    <button onClick={() => handleDelete(b.id)} className="px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
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
              <h3 className="text-lg font-bold text-gray-900">Buat Reservasi Baru</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {activeFacilities.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0" /> Belum ada ruangan aktif. Tambah ruangan terlebih dahulu.
                </div>
              )}
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Ruangan *</label>
                <select value={form.facilityId} onChange={e => setForm(f => ({ ...f, facilityId: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">— Pilih Ruangan —</option>
                  {activeFacilities.map(f => <option key={f.id} value={f.id}>{f.name} {f.capacity ? `(${f.capacity} orang)` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Diminta Oleh *</label>
                <input value={form.requestedBy} onChange={e => setForm(f => ({ ...f, requestedBy: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Nama pemohon" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Tujuan / Acara *</label>
                <input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Rapat pemuda, Pelatihan, dll" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Waktu Mulai *</label>
                  <input type="datetime-local" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Waktu Selesai *</label>
                  <input type="datetime-local" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Catatan</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 cursor-pointer">Batal</button>
                <button type="submit" disabled={saving || !form.facilityId} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl cursor-pointer">
                  {saving ? 'Menyimpan...' : 'Buat Reservasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
