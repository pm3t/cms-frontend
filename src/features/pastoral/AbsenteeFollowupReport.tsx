import React, { useState, useEffect } from 'react';
import { 
  Users, UserX, AlertTriangle, MessageCircle, Calendar, 
  Search, Filter, Download, Plus, CheckCircle, Clock, 
  Phone, Mail, MapPin, X, ArrowLeft, RefreshCw, HeartHandshake
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

interface AbsenteeMember {
  id: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  gender?: string;
  groups: string[];
  lastAttendedDate: string | null;
  lastServiceName: string | null;
  daysAbsent: number;
  latestVisitation: {
    id: string;
    visitDate: string;
    visitorName: string;
    type: string;
    status: string;
    purpose: string;
    notes?: string;
  } | null;
}

export default function AbsenteeFollowupReport() {
  const [absentees, setAbsentees] = useState<AbsenteeMember[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [daysFilter, setDaysFilter] = useState<number>(21);
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Pastoral Follow-up / Visitation
  const [selectedMember, setSelectedMember] = useState<AbsenteeMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formType, setFormType] = useState('HOME');
  const [formStatus, setFormStatus] = useState('COMPLETED');
  const [formVisitor, setFormVisitor] = useState('');
  const [formPurpose, setFormPurpose] = useState('Follow-up Ketidakhadiran');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    fetchData();
    fetchGroups();
  }, [daysFilter, groupFilter, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { days: daysFilter };
      if (groupFilter) params.groupId = groupFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/attendance/alerts/absentees', { params });
      setAbsentees(res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data jemaat absen", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data || []);
    } catch (err) {
      console.error("Gagal mengambil kelompok komsel", err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const openFollowupModal = (member: AbsenteeMember) => {
    setSelectedMember(member);
    setFormVisitor('');
    setFormNotes('');
    setFormStatus('COMPLETED');
    setFormType('PHONE');
    setIsModalOpen(true);
  };

  const handleSubmitFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setSubmitting(true);

    try {
      await api.post('/pastoral/visitations', {
        memberId: selectedMember.id,
        visitorName: formVisitor || 'Tim Pastoral',
        visitDate: new Date().toISOString(),
        type: formType,
        status: formStatus,
        purpose: formPurpose,
        notes: formNotes
      });

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Gagal menyimpan data follow-up');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppClick = (member: AbsenteeMember) => {
    if (!member.phone) {
      alert('Nomor HP jemaat ini belum terdaftar.');
      return;
    }
    let formattedPhone = member.phone.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }

    const message = encodeURIComponent(
      `Shalom ${member.firstName}, kami dari gereja merindukan kehadiranmu. Semoga kamu dan keluarga selalu dalam keadaan sehat dan penuh damai sejahtera. Ada yang bisa kami bantu atau doakan? 🙏`
    );

    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const exportToCSV = () => {
    if (absentees.length === 0) {
      alert('Tidak ada data untuk diexport');
      return;
    }

    const headers = ['Nama', 'No. Telepon', 'Email', 'Komsel', 'Terakhir Hadir', 'Hari Absen', 'Status Follow-up', 'Catatan Terakhir'];
    const rows = absentees.map(m => [
      `"${m.firstName} ${m.lastName || ''}"`,
      `"${m.phone || ''}"`,
      `"${m.email || ''}"`,
      `"${m.groups.join(', ') || 'Tanpa Komsel'}"`,
      `"${m.lastAttendedDate ? new Date(m.lastAttendedDate).toLocaleDateString('id-ID') : 'Belum Ada Record'}"`,
      m.daysAbsent === 999 ? 'Belum Pernah' : `${m.daysAbsent} hari`,
      `"${m.latestVisitation?.status || 'Belum Difollow-up'}"`,
      `"${(m.latestVisitation?.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Followup_Jemaat_Absen_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI Calculations
  const totalAbsentees = absentees.length;
  const uncontactedCount = absentees.filter(m => !m.latestVisitation).length;
  const contactedCount = absentees.filter(m => m.latestVisitation && m.latestVisitation.status !== 'COMPLETED').length;
  const completedCount = absentees.filter(m => m.latestVisitation && m.latestVisitation.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/reports" className="hover:text-primary-600">Laporan</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Follow-up Penggembalaan</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HeartHandshake className="w-7 h-7 text-primary-600" />
            Laporan Follow-up Jemaat Jarang Hadir
          </h2>
          <p className="text-sm text-gray-500">
            Identifikasi jemaat pasif/absen untuk memberikan perhatian pastoral & pendampingan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Total Jarang Hadir</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalAbsentees}</h3>
              <p className="text-xs text-gray-400 mt-0.5">&gt; {daysFilter} hari tidak hadir</p>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <UserX className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-amber-600 tracking-wider">Belum Difollow-up</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{uncontactedCount}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Memerlukan sapaan/kontak</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-blue-600 tracking-wider">Sedang Diproses</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">{contactedCount}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Dalam tahap pendampingan</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <MessageCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-emerald-600 tracking-wider">Selesai Difollow-up</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Sudah dikunjungi / dikontak</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau nomor HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          {/* Days Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Durasi Absen:</span>
            <select
              value={daysFilter}
              onChange={(e) => setDaysFilter(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500"
            >
              <option value={14}>&gt; 2 Minggu (14+ hari)</option>
              <option value={21}>&gt; 3 Minggu (21+ hari)</option>
              <option value={30}>&gt; 1 Bulan (30+ hari)</option>
              <option value={60}>&gt; 2 Bulan (60+ hari)</option>
              <option value={90}>&gt; 3 Bulan (90+ hari)</option>
            </select>
          </div>

          {/* Group Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Komsel:</span>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500 max-w-[160px]"
            >
              <option value="">Semua Komsel</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="UNCONTACTED">Belum Difollow-up</option>
              <option value="COMPLETED">Selesai</option>
              <option value="PLANNED">Terjadwal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
            <span>Memuat laporan jemaat absen...</span>
          </div>
        ) : absentees.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-semibold text-gray-900 text-lg">Semua Jemaat Active & Hadir!</h4>
            <p className="text-sm text-gray-500">Tidak ada jemaat yang memenuhi kriteria filter absen saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-500 tracking-wider">
                  <th className="px-6 py-4">Jemaat</th>
                  <th className="px-6 py-4">Komsel</th>
                  <th className="px-6 py-4">Terakhir Hadir</th>
                  <th className="px-6 py-4">Durasi Absen</th>
                  <th className="px-6 py-4">Status Pastoral</th>
                  <th className="px-6 py-4 text-right">Aksi Follow-up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {absentees.map((member) => {
                  const isSevere = member.daysAbsent >= 60;
                  const isModerate = member.daysAbsent >= 30;

                  return (
                    <tr key={member.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Jemaat Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm uppercase shrink-0">
                            {member.firstName[0]}{member.lastName ? member.lastName[0] : ''}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                              {member.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-gray-400" />
                                  {member.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Komsel */}
                      <td className="px-6 py-4 text-gray-600">
                        {member.groups.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {member.groups.map((g, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                {g}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Tanpa Komsel</span>
                        )}
                      </td>

                      {/* Terakhir Hadir */}
                      <td className="px-6 py-4">
                        {member.lastAttendedDate ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {new Date(member.lastAttendedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-xs text-gray-500">{member.lastServiceName || 'Ibadah Raya'}</div>
                          </div>
                        ) : (
                          <span className="text-amber-600 text-xs font-medium bg-amber-50 px-2 py-0.5 rounded">Belum ada record</span>
                        )}
                      </td>

                      {/* Durasi Absen */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          isSevere 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : isModerate 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {member.daysAbsent === 999 ? 'Belum Pernah Hadir' : `${member.daysAbsent} Hari Absen`}
                        </span>
                      </td>

                      {/* Status Pastoral */}
                      <td className="px-6 py-4">
                        {member.latestVisitation ? (
                          <div>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.latestVisitation.status === 'COMPLETED' 
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {member.latestVisitation.status === 'COMPLETED' ? 'Sudah Difollow-up' : 'Terjadwal / Proses'}
                            </span>
                            <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={member.latestVisitation.notes || ''}>
                              {member.latestVisitation.notes || member.latestVisitation.purpose}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Belum ada catatan</span>
                        )}
                      </td>

                      {/* Aksi Follow-up */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleWhatsAppClick(member)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 transition-colors"
                            title="Kirim Sapaan WhatsApp Direct"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Sapa WA
                          </button>
                          <button
                            onClick={() => openFollowupModal(member)}
                            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Catat Follow-up
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Input Catat Follow-up Pastoral */}
      {isModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 relative space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-primary-600" />
                Catat Follow-up Pastoral
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm uppercase">
                {selectedMember.firstName[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedMember.firstName} {selectedMember.lastName}</p>
                <p className="text-xs text-gray-500">Absen: {selectedMember.daysAbsent} hari • HP: {selectedMember.phone || '-'}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitFollowup} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Metode Kontak</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-sm focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="PHONE">Telepon / WhatsApp</option>
                    <option value="HOME">Kunjungan Rumah (Besuk)</option>
                    <option value="HOSPITAL">Kunjungan Rumah Sakit</option>
                    <option value="COUNSELING">Konseling Khusus</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status Hasil</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-sm focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="COMPLETED">Selesai (Sudah Dihubungi)</option>
                    <option value="PLANNED">Terjadwal Kunjungan</option>
                    <option value="CANCELLED">Batal / Tidak Dapat Dihubungi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Pengerja / Tim Pastoral</label>
                <input
                  type="text"
                  placeholder="Misal: Pdt. John / Tim Rayon 1"
                  value={formVisitor}
                  onChange={(e) => setFormVisitor(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tujuan / Pokok Pembicaraan</label>
                <input
                  type="text"
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Catatan Pastoral (Konfidensial)</label>
                <textarea
                  rows={3}
                  placeholder="Masukkan respon jemaat, pokok doa, atau alasan ketidakhadiran..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm flex items-center gap-2"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Follow-up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
