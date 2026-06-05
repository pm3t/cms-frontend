import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Send, Users, MessageSquare, Mail, Smartphone, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';
}

export default function BulkMessaging() {
  const queryClient = useQueryClient();
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [category, setCategory] = useState('ALL');
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: templates, isLoading: loadingTemplates } = useQuery({
    queryKey: ['communication', 'templates'],
    queryFn: async () => {
      const res = await api.get<Template[]>('/communications/templates');
      return res.data;
    }
  });

  const sendMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/communications/bulk', data);
      return res.data;
    },
    onSuccess: (data) => {
      setSuccess(data);
      setSelectedTemplateId('');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['communication', 'logs'] });
    },
    onError: (err: any) => {
      setError(err.message || 'Gagal mengirim pesan massal');
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId) return;
    
    if (!confirm('Apakah Anda yakin ingin mengirim pesan massal ini?')) return;

    sendMutation.mutate({
      templateId: selectedTemplateId,
      recipientCategory: category
    });
  };

  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Send className="w-6 h-6 text-primary-600" />
          Kirim Pesan Massal (Bulk Messaging)
        </h2>
        <p className="text-gray-500 mt-1">Kirim pesan ke seluruh jemaat atau kategori tertentu melalui berbagai channel.</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-bold">Pesan Massal Berhasil Dijadwalkan!</p>
            <p className="text-sm opacity-90">Sistem sedang memproses pengiriman ke {success.recipientCount} penerima. Anda dapat memantau status di log komunikasi.</p>
            <Button variant="ghost" size="sm" onClick={() => setSuccess(null)} className="mt-2 text-green-800 hover:bg-green-100">Tutup</Button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <form onSubmit={handleSend} className="md:col-span-2 space-y-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">1. Pilih Target Penerima</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'ALL', label: 'Semua Anggota', icon: Users },
                { id: 'ADULT', label: 'Jemaat Dewasa', icon: Users },
                { id: 'YOUTH', label: 'Pemuda/Remaja', icon: Users },
                { id: 'LEADERS', label: 'Pengurus/Pelayan', icon: Users },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    category === cat.id 
                    ? 'border-primary-600 bg-primary-50 text-primary-700' 
                    : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <cat.icon className="w-6 h-6 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">2. Pilih Template Pesan</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">-- Pilih Template --</option>
              {templates?.map(t => (
                <option key={t.id} value={t.id}>[{t.channel}] {t.name}</option>
              ))}
            </select>
            {loadingTemplates && <p className="text-xs text-gray-400">Loading templates...</p>}
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full py-6 text-lg" 
              disabled={!selectedTemplateId || sendMutation.isPending}
            >
              {sendMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Kirim Sekarang
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <MessageSquare className="w-24 h-24" />
            </div>
            
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Preview Pesan
            </h3>

            {selectedTemplate ? (
              <div className="space-y-4 relative">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  {selectedTemplate.channel === 'EMAIL' && <Mail className="w-3 h-3" />}
                  {selectedTemplate.channel === 'SMS' && <Smartphone className="w-3 h-3" />}
                  {selectedTemplate.channel === 'WHATSAPP' && <MessageSquare className="w-3 h-3" />}
                  {selectedTemplate.channel} Channel
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Subject:</p>
                  <p className="font-medium">{selectedTemplate.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Isi Pesan:</p>
                  <div className="bg-white/10 p-4 rounded-lg text-sm whitespace-pre-wrap leading-relaxed border border-white/10">
                    {selectedTemplate.body}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 italic text-sm">
                Pilih template untuk melihat preview
              </div>
            )}
          </div>

          <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
            <h4 className="font-bold text-primary-900 mb-2">Tips Komunikasi</h4>
            <ul className="text-sm text-primary-800 space-y-2 list-disc list-inside opacity-80">
              <li>Pastikan data nomor HP diawali dengan +62 untuk WA/SMS.</li>
              <li>Gunakan variabel seperti [Nama] jika template mendukung.</li>
              <li>Hindari mengirim pesan terlalu sering untuk mencegah blokir.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
