import React, { useState, useRef } from 'react';
import { BookOpen, Plus, Trash2, Upload, History, Tag, Mic, Calendar, X, FileText, Music, Video, Image, Eye } from 'lucide-react';
import { documentService } from './documentService';
import type { Document, DocumentCategory } from './documentService';
import { resolveFileUrl as getFileUrl } from '../../lib/config';

const CATEGORIES: { value: DocumentCategory; label: string; emoji: string }[] = [
  { value: 'SERMON', label: 'Khotbah', emoji: '📖' },
  { value: 'TEACHING', label: 'Materi Pengajaran', emoji: '📚' },
  { value: 'WORSHIP', label: 'Liturgi / Ibadah', emoji: '🎵' },
  { value: 'ADMINISTRATIVE', label: 'Administrasi', emoji: '📋' },
  { value: 'OTHER', label: 'Lainnya', emoji: '📄' },
];

function fileIcon(type?: string) {
  if (!type) return <FileText className="w-8 h-8 text-gray-400" />;
  if (type.startsWith('audio')) return <Music className="w-8 h-8 text-purple-400" />;
  if (type.startsWith('video')) return <Video className="w-8 h-8 text-red-400" />;
  if (type.startsWith('image')) return <Image className="w-8 h-8 text-green-400" />;
  if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
  return <FileText className="w-8 h-8 text-blue-400" />;
}

function formatBytes(b?: number | null) {
  if (!b) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

interface Props { documents: Document[]; onRefresh: () => void; }

export default function LibraryView({ documents, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState<Document | null>(null);
  const [catFilter, setCatFilter] = useState<DocumentCategory | ''>('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'SERMON' as DocumentCategory, speaker: '', date: '', tags: '', isPublic: false });
  const fileRef = useRef<HTMLInputElement>(null);
  const versionFileRef = useRef<HTMLInputElement>(null);
  const [versionNotes, setVersionNotes] = useState('');

  // Preview Modal State
  const [previewData, setPreviewData] = useState<{ isOpen: boolean; title: string; type: 'video' | 'audio' | 'pdf' | 'image' | 'generic'; url: string }>({
    isOpen: false,
    title: '',
    type: 'generic',
    url: ''
  });

  const handlePreview = (doc: Document) => {
    let type: 'video' | 'audio' | 'pdf' | 'image' | 'generic' = 'generic';
    const ft = doc.fileType?.toLowerCase() || '';
    const url = getFileUrl(doc.fileUrl);
    if (!url) return;

    if (ft.includes('pdf')) {
      type = 'pdf';
    } else if (ft.startsWith('audio') || url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.m4a')) {
      type = 'audio';
    } else if (ft.startsWith('video') || url.endsWith('.mp4') || url.endsWith('.webm')) {
      type = 'video';
    } else if (ft.startsWith('image') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif')) {
      type = 'image';
    }

    setPreviewData({
      isOpen: true,
      title: doc.title,
      type,
      url
    });
  };

  const filtered = documents.filter(d => {
    const matchCat = !catFilter || d.category === catFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || d.title.toLowerCase().includes(q) || (d.speaker || '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (fileRef.current?.files?.[0]) fd.append('file', fileRef.current.files[0]);
      await documentService.createDocument(fd);
      setShowModal(false);
      setForm({ title: '', description: '', category: 'SERMON', speaker: '', date: '', tags: '', isPublic: false });
      onRefresh();
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally { setSaving(false); }
  };

  const handleUploadVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showVersionModal || !versionFileRef.current?.files?.[0]) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('file', versionFileRef.current.files[0]);
      if (versionNotes) fd.append('notes', versionNotes);
      await documentService.uploadVersion(showVersionModal.id, fd);
      setShowVersionModal(null);
      setVersionNotes('');
      onRefresh();
    } catch (err: any) {
      alert('Gagal upload: ' + err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus dokumen ini beserta semua versinya?')) return;
    try { await documentService.deleteDocument(id); onRefresh(); }
    catch (err: any) { alert('Gagal hapus: ' + err.message); }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Perpustakaan Digital</h2>
          <p className="text-sm text-gray-500">Khotbah, materi pengajaran, liturgi, dan berkas gereja.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-blue-200 cursor-pointer">
          <Plus className="w-4 h-4" /> Upload Dokumen
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari judul, pembicara..." className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value as any)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Semua Kategori</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
        </select>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-semibold text-lg text-gray-700 mb-1">Belum Ada Dokumen</p>
          <p className="text-sm text-gray-500 mb-4">Upload dokumen pertama untuk perpustakaan digital gereja Anda.</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-sm rounded-xl inline-flex items-center gap-2 cursor-pointer">
            <Plus className="w-4 h-4" /> Upload Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(doc => {
            const cat = CATEGORIES.find(c => c.value === doc.category);
            return (
              <div key={doc.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-blue-50 rounded-xl">{fileIcon(doc.fileType)}</div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{cat?.emoji} {cat?.label}</span>
                    <h3 className="font-bold text-gray-900 mt-1 truncate group-hover:text-blue-600 transition-colors">{doc.title}</h3>
                  </div>
                </div>
                {doc.speaker && <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1"><Mic className="w-3.5 h-3.5" />{doc.speaker}</div>}
                {doc.date && <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1"><Calendar className="w-3.5 h-3.5" />{new Date(doc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>}
                {doc.tags && <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3"><Tag className="w-3 h-3" />{doc.tags}</div>}
                {doc.description && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{doc.description}</p>}
                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <History className="w-3 h-3" /> v{doc.currentVersion}
                    </span>
                    {doc.fileSize && <span className="text-xs text-gray-400">{formatBytes(doc.fileSize)}</span>}
                  </div>
                  <div className="flex gap-1">
                    {doc.fileUrl && (
                      <>
                        <button onClick={() => handlePreview(doc)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" title="Preview / Buka">
                          <Eye className="w-4 h-4" />
                        </button>
                        <a href={getFileUrl(doc.fileUrl)} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Download">
                          <Upload className="w-4 h-4 rotate-180" />
                        </a>
                      </>
                    )}
                    <button onClick={() => setShowVersionModal(doc)} className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-xl transition-all cursor-pointer" title="Upload versi baru">
                      <History className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(doc.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer" title="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Version history */}
                {doc.versions.length > 1 && (
                  <div className="mt-3 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Riwayat Versi</p>
                    <div className="space-y-1">
                      {doc.versions.slice(0, 3).map(v => (
                        <div key={v.id} className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-gray-600">v{v.version} — {v.fileName}</span>
                          <span className="text-gray-400">{new Date(v.createdAt).toLocaleDateString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Upload Dokumen Baru</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Judul Dokumen *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Khotbah Minggu - Kasih Karunia" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Kategori *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as DocumentCategory }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Pembicara / Penulis</label>
                  <input value={form.speaker} onChange={e => setForm(f => ({ ...f, speaker: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama pendeta / pengajar" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Tanggal</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Tag (pisah koma)</label>
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="iman, doa, kasih" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Deskripsi</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Ringkasan konten dokumen..." />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Upload File (PDF, Audio, Video — maks 50 MB)</label>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.mp3,.mp4,.webm,.jpg,.png" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <input id="pub" type="checkbox" checked={form.isPublic} onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))} className="w-4 h-4 accent-blue-600" />
                <label htmlFor="pub" className="text-sm font-semibold text-gray-700 cursor-pointer">Dokumen publik (dapat diakses jemaat)</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 cursor-pointer">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl cursor-pointer">
                  {saving ? 'Menyimpan...' : 'Upload Dokumen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Version Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowVersionModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Upload Versi Baru</h3>
                <p className="text-sm text-gray-500">Dokumen: <strong>{showVersionModal.title}</strong> (saat ini v{showVersionModal.currentVersion})</p>
              </div>
              <button onClick={() => setShowVersionModal(null)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUploadVersion} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">File Baru *</label>
                <input ref={versionFileRef} type="file" required accept=".pdf,.doc,.docx,.ppt,.pptx,.mp3,.mp4,.webm,.jpg,.png" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-600" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Catatan Perubahan</label>
                <input value={versionNotes} onChange={e => setVersionNotes(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Apa yang berubah di versi ini?" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowVersionModal(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 cursor-pointer">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl cursor-pointer">
                  {saving ? 'Mengupload...' : 'Upload Versi Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewData.isOpen}
        onClose={() => setPreviewData(prev => ({ ...prev, isOpen: false }))}
        title={previewData.title}
        type={previewData.type}
        url={previewData.url}
      />
    </div>
  );
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'video' | 'audio' | 'pdf' | 'image' | 'generic';
  url: string;
}

function PreviewModal({ isOpen, onClose, title, type, url }: PreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded tracking-wider">
              {type} Preview
            </span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-gray-50/50 flex-1 flex flex-col justify-center items-center overflow-y-auto min-h-[300px]">
          {type === 'video' && (
            <video controls className="w-full aspect-video rounded-xl shadow-md border border-gray-200 bg-black">
              <source src={url} />
              Your browser does not support the video tag.
            </video>
          )}

          {type === 'audio' && (
            <div className="w-full max-w-md flex flex-col items-center justify-center p-8 bg-white border border-gray-100 rounded-2xl space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 animate-pulse">
                <Music className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900 text-lg">{title}</p>
                <p className="text-xs text-gray-500 mt-1">Audio Player</p>
              </div>
              <audio controls className="w-full mt-4">
                <source src={url} />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {type === 'pdf' && (
            <iframe
              src={url}
              className="w-full h-[60vh] rounded-xl border border-gray-200 shadow-md bg-white"
              title={title}
            />
          )}

          {type === 'image' && (
            <img src={url} alt={title} className="max-w-full max-h-[60vh] rounded-xl object-contain shadow-md border border-gray-200 bg-white" />
          )}

          {type === 'generic' && (
            <div className="text-center p-8 space-y-4">
              <FileText className="w-16 h-16 text-gray-400 mx-auto" />
              <p className="text-gray-600 font-medium">Pratinjau tidak didukung untuk tipe file ini.</p>
              <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 transition-colors">
                Download untuk Membuka
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
