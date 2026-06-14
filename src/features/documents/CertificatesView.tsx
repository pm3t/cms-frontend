import React, { useState, useRef } from 'react';
import { Award, Plus, Trash2, Edit2, X, CheckCircle, Download, FileText, Printer } from 'lucide-react';
import { documentService } from './documentService';
import type { Certificate, CertificateTemplate, CertificateType } from './documentService';
import Select from 'react-select';
import { resolveFileUrl as getFileUrl } from '../../lib/config';

const CERT_TYPES: { value: CertificateType; label: string; emoji: string; color: string }[] = [
  { value: 'BAPTISM', label: 'Baptis', emoji: '🕊️', color: 'bg-blue-50 text-blue-700' },
  { value: 'MARRIAGE', label: 'Nikah', emoji: '💍', color: 'bg-pink-50 text-pink-700' },
  { value: 'CONFIRMATION', label: 'Sidi', emoji: '✝️', color: 'bg-purple-50 text-purple-700' },
  { value: 'DEDICATION', label: 'Penyerahan Anak', emoji: '👶', color: 'bg-teal-50 text-teal-700' },
  { value: 'MEMBERSHIP', label: 'Surat Pindah', emoji: '📜', color: 'bg-amber-50 text-amber-700' },
  { value: 'OTHER', label: 'Lainnya', emoji: '📄', color: 'bg-gray-50 text-gray-700' },
];

const populateTemplate = (cert: Certificate, templates: CertificateTemplate[]) => {
  let tmpl = templates.find(t => t.id === cert.templateId);
  if (!tmpl) {
    tmpl = templates.find(t => t.type === cert.type && t.isDefault);
  }
  if (!tmpl) {
    tmpl = templates.find(t => t.type === cert.type);
  }
  if (!tmpl) {
    return `
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 40px;">
          <h2>Template tidak ditemukan</h2>
          <p>Silakan buat template untuk jenis sertifikat ini terlebih dahulu di tab "Template Sertifikat".</p>
        </body>
      </html>
    `;
  }

  const certTypeLabel = CERT_TYPES.find(t => t.value === cert.type)?.label || cert.type;
  
  const dateStr = new Date(cert.issuedDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return tmpl.content
    .replace(/{{recipient_name}}/g, cert.recipientName || '')
    .replace(/{{issued_date}}/g, dateStr)
    .replace(/{{issued_by}}/g, cert.issuedBy || '')
    .replace(/{{location}}/g, cert.location || '')
    .replace(/{{church_name}}/g, 'Gereja')
    .replace(/{{cert_type}}/g, certTypeLabel);
};

const emptyForm = {
  memberId: '', type: 'BAPTISM' as CertificateType, recipientName: '',
  recipientAddress: '', issuedDate: '', issuedBy: '', location: '', templateId: '', notes: '',
};

interface Props {
  certificates: Certificate[];
  members: any[];
  templates: CertificateTemplate[];
  onRefresh: () => void;
}

export default function CertificatesView({ certificates, members, templates, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [typeFilter, setTypeFilter] = useState<CertificateType | ''>('');
  const [search, setSearch] = useState('');
  const [printCert, setPrintCert] = useState<Certificate | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = certificates.filter(c => {
    const matchType = !typeFilter || c.type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || c.recipientName.toLowerCase().includes(q) || c.certificateNumber.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setShowModal(true);
    setTimeout(() => {
      if (fileRef.current) fileRef.current.value = '';
    }, 0);
  };
  const openEdit = (c: Certificate) => {
    setEditing(c);
    setForm({
      memberId: c.memberId || '',
      type: c.type,
      recipientName: c.recipientName,
      recipientAddress: c.recipientAddress || '',
      issuedDate: c.issuedDate.substring(0, 10),
      issuedBy: c.issuedBy,
      location: c.location || '',
      templateId: c.templateId || '',
      notes: c.notes || '',
    });
    setShowModal(true);
    setTimeout(() => {
      if (fileRef.current) fileRef.current.value = '';
    }, 0);
  };

  const handleMemberSelect = (memberId: string) => {
    const m = members.find(m => m.id === memberId);
    setForm(f => ({ ...f, memberId, recipientName: m ? `${m.firstName} ${m.lastName || ''}`.trim() : f.recipientName }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('issuedDate', form.issuedDate);
      formData.append('recipientName', form.recipientName);
      formData.append('issuedBy', form.issuedBy);
      if (form.memberId) formData.append('memberId', form.memberId);
      if (form.recipientAddress) formData.append('recipientAddress', form.recipientAddress);
      if (form.location) formData.append('location', form.location);
      if (form.templateId) formData.append('templateId', form.templateId);
      if (form.notes) formData.append('notes', form.notes);

      if (fileRef.current?.files?.[0]) {
        formData.append('file', fileRef.current.files[0]);
      }

      if (editing) {
        await documentService.updateCertificate(editing.id, formData);
      } else {
        await documentService.createCertificate(formData);
      }
      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus sertifikat ini?')) return;
    try { await documentService.deleteCertificate(id); onRefresh(); }
    catch (err: any) { alert('Gagal hapus: ' + err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Sertifikat Jemaat</h2>
          <p className="text-sm text-gray-500">Kelola sertifikat baptis, nikah, sidi, dan surat keterangan jemaat.</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-amber-200 cursor-pointer">
          <Plus className="w-4 h-4" /> Buat Sertifikat
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, nomor sertifikat..." className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-amber-500" />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
          <option value="">Semua Jenis</option>
          {CERT_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
        </select>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-semibold text-lg text-gray-700 mb-1">Belum Ada Sertifikat</p>
          <p className="text-sm text-gray-500 mb-4">Buat sertifikat pertama untuk jemaat Anda.</p>
          <button onClick={openCreate} className="px-4 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 font-bold text-sm rounded-xl inline-flex items-center gap-2 cursor-pointer">
            <Plus className="w-4 h-4" /> Buat Pertama
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Nomor Sertifikat', 'Jenis', 'Nama Penerima', 'Tanggal', 'Ditandatangani', 'Lokasi', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(cert => {
                const ct = CERT_TYPES.find(t => t.value === cert.type);
                return (
                  <tr key={cert.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-800 text-xs bg-gray-100 px-2 py-1 rounded-lg">{cert.certificateNumber}</span>
                        {cert.fileUrl && <span title="PDF Terunggah"><FileText className="w-3.5 h-3.5 text-red-500 shrink-0" /></span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${ct?.color}`}>{ct?.emoji} {ct?.label}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{cert.recipientName}</p>
                      {cert.member && <p className="text-xs text-gray-400">Jemaat terdaftar</p>}
                    </td>
                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                      {new Date(cert.issuedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4 text-gray-600">{cert.issuedBy}</td>
                    <td className="px-4 py-4 text-gray-500">{cert.location || '-'}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {cert.fileUrl && (
                          <a href={getFileUrl(cert.fileUrl)} download target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all" title="Download PDF">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {(cert.templateId || templates.some(t => t.type === cert.type)) && (
                          <button onClick={() => setPrintCert(cert)} className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-all cursor-pointer" title="Cetak dari Template">
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => openEdit(cert)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(cert.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit Sertifikat' : 'Buat Sertifikat Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editing && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-800 font-semibold">Nomor sertifikat akan digenerate otomatis berdasarkan jenis dan tahun.</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Jenis Sertifikat *</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as CertificateType }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                    {CERT_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Tanggal Diterbitkan *</label>
                  <input type="date" value={form.issuedDate} onChange={e => setForm(f => ({ ...f, issuedDate: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Pilih Anggota (opsional)</label>
                <Select
                  options={members.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName || ''}`.trim() }))}
                  value={members.find(m => m.id === form.memberId) ? { value: form.memberId, label: `${members.find(m => m.id === form.memberId)?.firstName} ${members.find(m => m.id === form.memberId)?.lastName || ''}`.trim() } : null}
                  onChange={(selected: any) => handleMemberSelect(selected ? selected.value : '')}
                  isClearable
                  placeholder="Cari anggota berdasarkan nama..."
                  className="text-sm font-normal text-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Nama Penerima *</label>
                <input value={form.recipientName} onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Nama lengkap penerima sertifikat" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Ditandatangani Oleh *</label>
                <input value={form.issuedBy} onChange={e => setForm(f => ({ ...f, issuedBy: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Nama pendeta / majelis" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Lokasi</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Gereja / tempat" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Template</label>
                  <select value={form.templateId} onChange={e => setForm(f => ({ ...f, templateId: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="">— Tanpa template —</option>
                    {templates.filter(t => t.type === form.type || t.type === 'OTHER').map(t => <option key={t.id} value={t.id}>{t.name}{t.isDefault ? ' (Default)' : ''}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Catatan</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" placeholder="Catatan tambahan..." />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">File Sertifikat (PDF)</label>
                <input ref={fileRef} type="file" accept=".pdf" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-600 hover:file:bg-amber-100 cursor-pointer" />
                {editing?.fileUrl && (
                  <p className="text-xs text-gray-400 mt-1">Sertifikat sudah terunggah. Pilih file baru untuk menggantinya.</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 cursor-pointer">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold text-sm rounded-xl cursor-pointer">
                  {saving ? 'Menyimpan...' : (editing ? 'Simpan Perubahan' : 'Buat Sertifikat')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print/Preview Modal */}
      {printCert && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPrintCert(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded tracking-wider">
                  Cetak Sertifikat
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">Sertifikat: {printCert.recipientName}</h3>
              </div>
              <button onClick={() => setPrintCert(null)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 p-4 flex justify-center">
              <iframe
                id="print-iframe"
                srcDoc={populateTemplate(printCert, templates)}
                className="w-full h-[600px] border border-gray-200 rounded-xl shadow-md bg-white max-w-[800px]"
                title="Sertifikat Preview"
              />
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button type="button" onClick={() => setPrintCert(null)} className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 cursor-pointer">Tutup</button>
              <button type="button" onClick={() => {
                const iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
                if (iframe?.contentWindow) {
                  iframe.contentWindow.focus();
                  iframe.contentWindow.print();
                }
              }} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl cursor-pointer flex items-center gap-2">
                <Printer className="w-4 h-4" /> Cetak / Simpan PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
