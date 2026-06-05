import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { BookOpen, Plus, FileText, Calendar, Link as LinkIcon, Trash2, Edit2, Loader2, ExternalLink } from 'lucide-react';

interface Newsletter {
  id: string;
  title: string;
  content: string | null;
  coverUrl: string | null;
  pdfUrl: string | null;
  publishDate: string;
  isActive: boolean;
}

export default function NewsletterManagement() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    pdfUrl: '',
    coverUrl: '',
    publishDate: new Date().toISOString().split('T')[0]
  });

  const { data: newsletters, isLoading } = useQuery({
    queryKey: ['communication', 'newsletters'],
    queryFn: async () => {
      const res = await api.get<Newsletter[]>('/newsletters');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/newsletters', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication', 'newsletters'] });
      setIsAdding(false);
      setFormData({ title: '', content: '', pdfUrl: '', coverUrl: '', publishDate: new Date().toISOString().split('T')[0] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/newsletters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication', 'newsletters'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-600" />
            Digital Bulletin / Newsletter
          </h2>
          <p className="text-gray-500 mt-1">Kelola buletin mingguan atau warta jemaat digital.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Batal' : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Buletin Baru
            </>
          )}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg animate-in zoom-in-95 duration-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Judul Buletin</label>
              <input
                type="text"
                placeholder="Warta Jemaat - 12 Mei 2026"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Tanggal Terbit</label>
              <input
                type="date"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={formData.publishDate}
                onChange={e => setFormData({ ...formData, publishDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Link PDF / Google Drive (Opsional)</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={formData.pdfUrl}
                onChange={e => setFormData({ ...formData, pdfUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Link Gambar Cover (Opsional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              value={formData.coverUrl}
              onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Catatan Singkat (Ringkasan)</label>
            <textarea
              placeholder="Ringkasan ibadah minggu ini..."
              rows={3}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsAdding(false)}>Batal</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan Buletin
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>
      ) : newsletters?.length === 0 ? (
        <div className="py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Belum ada buletin digital yang dipublikasikan.</p>
          <Button variant="ghost" className="mt-4" onClick={() => setIsAdding(true)}>Buat yang pertama</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsletters?.map(n => (
            <div key={n.id} className="group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-[16/9] bg-gray-100 relative">
                {n.coverUrl ? (
                  <img src={n.coverUrl} alt={n.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <FileText className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-sm">
                  {new Date(n.publishDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{n.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                  {n.content || 'Tidak ada ringkasan tersedia.'}
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-gray-50">
                  <div className="flex gap-1">
                    {n.pdfUrl && (
                      <a href={n.pdfUrl} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => { if(confirm('Hapus buletin?')) deleteMutation.mutate(n.id); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
