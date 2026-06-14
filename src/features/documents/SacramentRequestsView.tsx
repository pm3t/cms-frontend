import React, { useState, useEffect } from 'react';
import { FileText, Search, CheckCircle, XCircle, Clock, Eye, Download, AlertCircle, Calendar, MapPin, User, ChevronRight, X } from 'lucide-react';
import { documentService } from './documentService';
import api from '../../lib/axios';

interface Props {
  onRefresh: () => void;
}

export default function SacramentRequestsView({ onRefresh }: Props) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  
  // Selected request
  const [selectedReq, setSelectedReq] = useState<any | null>(null);

  // Approve Form
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [issuedBy, setIssuedBy] = useState('');
  const [location, setLocation] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reject Form
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await documentService.getSacramentRequests();
      setRequests(data || []);
      
      // If a request was selected, update its reference from the newly fetched list
      if (selectedReq) {
        const updated = data.find((r: any) => r.id === selectedReq.id);
        setSelectedReq(updated || null);
      }
    } catch (err) {
      console.error('Error fetching sacrament requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSelectReq = (req: any) => {
    setSelectedReq(req);
    // Reset forms
    setShowApproveForm(false);
    setShowRejectForm(false);
    setIssuedBy(req.pastorName || '');
    setLocation(req.location || '');
    setApproveNotes('');
    setCustomFile(null);
    setRejectNotes('');
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('issuedBy', issuedBy);
      formData.append('location', location);
      formData.append('notes', approveNotes);
      if (customFile) {
        formData.append('file', customFile);
      }

      await documentService.approveSacramentRequest(selectedReq.id, formData);
      alert('Pengajuan berhasil disetujui, sertifikat telah diterbitkan!');
      setShowApproveForm(false);
      fetchRequests();
      onRefresh();
    } catch (err: any) {
      alert('Gagal menyetujui: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;
    if (!rejectNotes.trim()) {
      return alert('Alasan penolakan wajib diisi!');
    }
    setSubmitting(true);

    try {
      await documentService.rejectSacramentRequest(selectedReq.id, rejectNotes);
      alert('Pengajuan telah ditolak.');
      setShowRejectForm(false);
      fetchRequests();
      onRefresh();
    } catch (err: any) {
      alert('Gagal menolak: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const getSacramentLabel = (type: string) => {
    switch (type) {
      case 'BAPTISM': return 'Baptis Kudus';
      case 'MARRIAGE': return 'Pemberkatan Pernikahan';
      case 'CONFIRMATION': return 'Sidi / Konfirmasi';
      case 'DEDICATION': return 'Penyerahan Anak';
      case 'MEMBERSHIP': return 'Surat Pindah / Keanggotaan';
      default: return 'Lainnya';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': 
        return <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Disetujui</span>;
      case 'REJECTED': 
        return <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Ditolak</span>;
      default: 
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1"><Clock className="w-3.5 h-3.5 animate-pulse" /> Pending</span>;
    }
  };

  // Filter requests
  const filtered = requests.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const memberName = `${r.member?.firstName || ''} ${r.member?.lastName || ''}`.toLowerCase();
    const matchesSearch = memberName.includes(search.toLowerCase()) || 
                          getSacramentLabel(r.type).toLowerCase().includes(search.toLowerCase()) ||
                          (r.location || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pengajuan Sakramen & Dokumen</h2>
          <p className="text-sm text-gray-500">Daftar pengajuan sakramen oleh jemaat melalui aplikasi mobile untuk verifikasi berkas dan penerbitan sertifikat digital.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab === 'ALL' ? 'Semua' : tab === 'PENDING' ? 'Pending' : tab === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Cari nama jemaat, jenis sakramen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Requests List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center bg-white">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="font-semibold text-lg text-gray-700 mb-1">Tidak Ada Pengajuan</p>
              <p className="text-sm text-gray-500">Tidak ditemukan pengajuan sakramen yang cocok dengan filter saat ini.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {filtered.map((req) => {
                  const isSelected = selectedReq?.id === req.id;
                  return (
                    <div
                      key={req.id}
                      onClick={() => handleSelectReq(req)}
                      className={`p-5 hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected ? 'bg-blue-50/50 hover:bg-blue-50/50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900">{getSacramentLabel(req.type)}</h4>
                          {getStatusBadge(req.status)}
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                          Jemaat: {req.member?.firstName} {req.member?.lastName}
                        </p>
                        <div className="flex gap-4 text-xs text-gray-400 font-medium">
                          <span>📅 Rencana: {req.date ? new Date(req.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                          <span>📍 Lokasi: {req.location || '-'}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Detail Panel */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit">
          {selectedReq ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{getSacramentLabel(selectedReq.type)}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">ID Pengajuan: {selectedReq.id}</p>
                </div>
                <button
                  onClick={() => setSelectedReq(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500">STATUS:</span>
                {getStatusBadge(selectedReq.status)}
              </div>

              {/* Applicant Info */}
              <div className="space-y-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Detail Pemohon</h4>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="font-semibold">{selectedReq.member?.firstName} {selectedReq.member?.lastName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Rencana: <span className="font-semibold">{selectedReq.date ? new Date(selectedReq.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Lokasi: <span className="font-semibold">{selectedReq.location || '-'}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Pastor Pelaksana: <span className="font-semibold">{selectedReq.pastorName || '-'}</span></span>
                  </div>
                </div>
              </div>

              {/* Uploaded Requirements files */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Persyaratan Dokumen (KTP / Akta)</h4>
                {selectedReq.requirements && selectedReq.requirements.length > 0 ? (
                  <div className="space-y-2">
                    {selectedReq.requirements.map((reqFile: any, index: number) => {
                      const fullUrl = reqFile.url.startsWith('http') 
                        ? reqFile.url 
                        : `${api.defaults.baseURL?.replace('/api', '')}${reqFile.url}`;
                      return (
                        <div key={index} className="flex items-center justify-between border border-gray-200 rounded-xl p-3 bg-white hover:border-blue-300 transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{reqFile.name}</p>
                              <p className="text-xs text-gray-400 font-medium">Gambar Berkas</p>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <a
                              href={fullUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Lihat Gambar"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </a>
                            <a
                              href={fullUrl}
                              download
                              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                              title="Unduh"
                            >
                              <Download className="w-4.5 h-4.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic">Tidak ada berkas persyaratan yang dilampirkan.</div>
                )}
              </div>

              {/* Actions Section */}
              {selectedReq.status === 'PENDING' && !showApproveForm && !showRejectForm && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="flex-1 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm rounded-xl transition-all cursor-pointer text-center"
                  >
                    Tolak Pengajuan
                  </button>
                  <button
                    onClick={() => setShowApproveForm(true)}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold text-sm rounded-xl transition-all cursor-pointer text-center"
                  >
                    Setujui & Terbit
                  </button>
                </div>
              )}

              {/* Approve Form */}
              {showApproveForm && (
                <form onSubmit={handleApprove} className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
                    <h4 className="font-bold text-green-900 text-sm flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-600" /> Setujui & Terbitkan Sertifikat</h4>
                    <p className="text-xs text-green-700 mt-1">Mengonfirmasi pengajuan ini akan melahirkan data Sertifikat baru secara otomatis di tab "Sertifikat Jemaat".</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Diterbitkan Oleh (Pastor/Pendeta) *</label>
                      <input
                        type="text"
                        value={issuedBy}
                        onChange={(e) => setIssuedBy(e.target.value)}
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: Pdt. Yohanes Sutopo"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Tempat/Lokasi Ibadah *</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: Gedung GBI HOS Lantai 3"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Catatan Sertifikat (Notes)</label>
                      <textarea
                        value={approveNotes}
                        onChange={(e) => setApproveNotes(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Ucapan selamat atau catatan berkas..."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Upload File Sertifikat PDF (Opsional)</label>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setCustomFile(file);
                        }}
                        className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowApproveForm(false)}
                      className="flex-1 py-2 border border-gray-200 text-gray-500 font-bold text-xs rounded-xl hover:bg-gray-50 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl disabled:opacity-60 cursor-pointer"
                    >
                      {submitting ? 'Memproses...' : 'Setujui Pengajuan'}
                    </button>
                  </div>
                </form>
              )}

              {/* Reject Form */}
              {showRejectForm && (
                <form onSubmit={handleReject} className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                    <h4 className="font-bold text-red-900 text-sm flex items-center gap-1.5"><XCircle className="w-4 h-4 text-red-600" /> Tolak Pengajuan Sakramen</h4>
                    <p className="text-xs text-red-700 mt-1">Berikan alasan penolakan yang jelas agar jemaat dapat memperbaikinya kembali.</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Alasan Penolakan *</label>
                    <textarea
                      value={rejectNotes}
                      onChange={(e) => setRejectNotes(e.target.value)}
                      required
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Contoh: Berkas foto KTP tidak terbaca jelas. Mohon unggah kembali..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(false)}
                      className="flex-1 py-2 border border-gray-200 text-gray-500 font-bold text-xs rounded-xl hover:bg-gray-50 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl disabled:opacity-60 cursor-pointer"
                    >
                      {submitting ? 'Memproses...' : 'Tolak Pengajuan'}
                    </button>
                  </div>
                </form>
              )}

              {/* View Approved Details */}
              {selectedReq.status === 'APPROVED' && selectedReq.certificate && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Sertifikat Digital Diterbitkan</h4>
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">Nomor Sertifikat</p>
                      <p className="text-sm font-extrabold text-blue-900">{selectedReq.certificate.certificateNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">Diterbitkan Oleh</p>
                      <p className="text-sm font-bold text-gray-800">{selectedReq.certificate.issuedBy}</p>
                    </div>
                    {selectedReq.notes && (
                      <div>
                        <p className="text-xs text-gray-400 font-semibold">Catatan Admin</p>
                        <p className="text-xs text-gray-700 mt-1">{selectedReq.notes}</p>
                      </div>
                    )}
                    {selectedReq.certificate.fileUrl && (
                      <a
                        href={selectedReq.certificate.fileUrl.startsWith('http') 
                          ? selectedReq.certificate.fileUrl 
                          : `${api.defaults.baseURL?.replace('/api', '')}${selectedReq.certificate.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" /> Unduh Sertifikat
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* View Rejected Details */}
              {selectedReq.status === 'REJECTED' && selectedReq.notes && (
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Catatan Penolakan</h4>
                  <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-red-800 font-bold">Ditolak oleh Admin</p>
                      <p className="text-xs text-red-700 mt-1 leading-relaxed">{selectedReq.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center p-4">
              <FileText className="w-12 h-12 text-gray-300 mb-3" />
              <h4 className="font-bold text-gray-700 text-sm">Pilih Pengajuan</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Pilih salah satu pengajuan di panel kiri untuk melihat berkas jemaat, memverifikasi data, dan melakukan persetujuan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
