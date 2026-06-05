import React, { useState } from 'react';
import { FileCode, Plus, Trash2, Edit2, Star, X } from 'lucide-react';
import { documentService } from './documentService';
import type { CertificateTemplate, CertificateType } from './documentService';

const CERT_TYPES: { value: CertificateType; label: string; emoji: string }[] = [
  { value: 'BAPTISM', label: 'Baptis', emoji: '🕊️' },
  { value: 'MARRIAGE', label: 'Nikah', emoji: '💍' },
  { value: 'CONFIRMATION', label: 'Sidi', emoji: '✝️' },
  { value: 'MEMBERSHIP', label: 'Surat Pindah', emoji: '📜' },
  { value: 'OTHER', label: 'Lainnya', emoji: '📄' },
];

const DEFAULT_TEMPLATE_CONTENT = `<!DOCTYPE html>
<html>
<head><style>
  body { font-family: serif; padding: 40px; text-align: center; }
  .title { font-size: 28px; font-weight: bold; color: #1e3a8a; }
  .subtitle { font-size: 16px; color: #64748b; margin: 8px 0 24px; }
  .name { font-size: 32px; font-style: italic; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; display: inline-block; padding: 0 40px 8px; margin: 16px 0; }
  .body { font-size: 14px; line-height: 1.8; max-width: 600px; margin: 0 auto; }
  .signature { margin-top: 60px; display: flex; justify-content: space-around; }
  .sig-box { text-align: center; }
  .sig-line { border-top: 1px solid #000; width: 180px; margin: 60px auto 4px; }
</style></head>
<body>
  <p class="title">SERTIFIKAT</p>
  <p class="subtitle">{{church_name}}</p>
  <p class="body">Dengan ini menyatakan bahwa</p>
  <p class="name">{{recipient_name}}</p>
  <p class="body">telah menerima {{cert_type}} pada tanggal {{issued_date}} di {{location}}.</p>
  <div class="signature">
    <div class="sig-box">
      <div class="sig-line"></div>
      <p>{{issued_by}}</p>
      <p>Pendeta</p>
    </div>
  </div>
</body>
</html>`;

const emptyForm = { name: '', type: 'BAPTISM' as CertificateType, content: DEFAULT_TEMPLATE_CONTENT, isDefault: false };

interface Props { templates: CertificateTemplate[]; onRefresh: () => void; }

export default function TemplatesView({ templates, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CertificateTemplate | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<CertificateTemplate | null>(null);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit = (t: CertificateTemplate) => {
    setEditing(t);
    setForm({ name: t.name, type: t.type, content: t.content, isDefault: t.isDefault });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await documentService.updateTemplate(editing.id, form); }
      else { await documentService.createTemplate(form); }
      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally { setSaving(false); }
  };

  const handleSetDefault = async (t: CertificateTemplate) => {
    try { await documentService.updateTemplate(t.id, { isDefault: true }); onRefresh(); }
    catch (err: any) { alert('Gagal: ' + err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus template ini?')) return;
    try { await documentService.deleteTemplate(id); onRefresh(); }
    catch (err: any) { alert('Gagal hapus: ' + err.message); }
  };

  // Group templates by type
  const grouped = CERT_TYPES.map(ct => ({
    ...ct,
    items: templates.filter(t => t.type === ct.value),
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Template Sertifikat</h2>
          <p className="text-sm text-gray-500">Buat dan kelola template HTML untuk setiap jenis sertifikat gereja.</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-purple-200 cursor-pointer">
          <Plus className="w-4 h-4" /> Buat Template
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="p-2 bg-purple-100 rounded-xl text-purple-600 shrink-0"><FileCode className="w-5 h-5" /></div>
        <div>
          <p className="font-bold text-purple-900 text-sm">Template HTML Sertifikat</p>
          <p className="text-xs text-purple-800 mt-1">
            Template menggunakan HTML dengan variabel: <code className="bg-purple-100 px-1 rounded">{'{{recipient_name}}'}</code>, <code className="bg-purple-100 px-1 rounded">{'{{issued_date}}'}</code>, <code className="bg-purple-100 px-1 rounded">{'{{issued_by}}'}</code>, <code className="bg-purple-100 px-1 rounded">{'{{location}}'}</code>, <code className="bg-purple-100 px-1 rounded">{'{{church_name}}'}</code>, <code className="bg-purple-100 px-1 rounded">{'{{cert_type}}'}</code>.
          </p>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <FileCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-semibold text-lg text-gray-700 mb-1">Belum Ada Template</p>
          <p className="text-sm text-gray-500 mb-4">Buat template sertifikat agar dapat digunakan saat membuat sertifikat jemaat.</p>
          <button onClick={openCreate} className="px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 font-bold text-sm rounded-xl inline-flex items-center gap-2 cursor-pointer">
            <Plus className="w-4 h-4" /> Buat Template Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(group => (
            <div key={group.value}>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>{group.emoji}</span> {group.label}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map(t => (
                  <div key={t.id} className={`relative bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all ${t.isDefault ? 'border-purple-300 ring-1 ring-purple-200' : 'border-gray-100 hover:border-purple-100'}`}>
                    {t.isDefault && (
                      <div className="absolute -top-2.5 left-4">
                        <span className="bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> Default
                        </span>
                      </div>
                    )}
                    <div className="mt-2">
                      <h4 className="font-bold text-gray-900">{t.name}</h4>
                      <p className="text-xs text-gray-400 mt-1">Dibuat: {new Date(t.createdAt).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div className="mt-4 bg-gray-50 rounded-xl p-3 font-mono text-xs text-gray-500 line-clamp-3 overflow-hidden">
                      {t.content}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => setPreview(t)} className="flex-1 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-xs rounded-xl transition-all cursor-pointer">Preview</button>
                      {!t.isDefault && (
                        <button onClick={() => handleSetDefault(t)} className="flex-1 py-2 border border-purple-200 text-purple-600 hover:bg-purple-50 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1">
                          <Star className="w-3 h-3" /> Set Default
                        </button>
                      )}
                      <button onClick={() => openEdit(t)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit Template' : 'Buat Template Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Nama Template *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Contoh: Template Baptis Formal" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Jenis Sertifikat *</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as CertificateType }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    {CERT_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Konten HTML *</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required rows={16} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <input id="def" type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} className="w-4 h-4 accent-purple-600" />
                <label htmlFor="def" className="text-sm font-semibold text-gray-700 cursor-pointer">Jadikan template default untuk jenis ini</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 cursor-pointer">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl cursor-pointer">
                  {saving ? 'Menyimpan...' : (editing ? 'Simpan Perubahan' : 'Buat Template')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Preview: {preview.name}</h3>
              <button onClick={() => setPreview(null)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe
                srcDoc={preview.content
                  .replace(/{{recipient_name}}/g, 'Nama Penerima')
                  .replace(/{{issued_date}}/g, new Date().toLocaleDateString('id-ID'))
                  .replace(/{{issued_by}}/g, 'Pdt. Nama Pendeta')
                  .replace(/{{location}}/g, 'Gereja Contoh')
                  .replace(/{{church_name}}/g, 'Gereja Anda')
                  .replace(/{{cert_type}}/g, CERT_TYPES.find(t => t.value === preview.type)?.label || preview.type)
                }
                className="w-full h-[600px] border-0"
                title="Template Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
