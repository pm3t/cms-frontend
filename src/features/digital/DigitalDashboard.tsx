import React, { useState, useEffect } from 'react';
import { digitalService } from './digitalService';
import { Video, FileText, Globe, Key, Trash2, Plus, Save, Play, Music, Volume2, Eye, X, BookOpen } from 'lucide-react';

type TabId = 'SERMONS' | 'INTEGRATIONS';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'video' | 'audio' | 'pdf';
  url: string;
}

function PreviewModal({ isOpen, onClose, title, type, url }: PreviewModalProps) {
  if (!isOpen) return null;

  const getYoutubeEmbedUrl = (urlStr: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = urlStr.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const isYouTube = type === 'video' && getYoutubeEmbedUrl(url);
  const embedUrl = isYouTube ? getYoutubeEmbedUrl(url) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded tracking-wider">
              {type} Preview
            </span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-gray-50/50 flex-1 flex flex-col justify-center items-center">
          {type === 'video' && (
            isYouTube ? (
              <iframe
                className="w-full aspect-video rounded-xl shadow-md border border-gray-200"
                src={embedUrl || ''}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video controls className="w-full aspect-video rounded-xl shadow-md border border-gray-200 bg-black">
                <source src={url} />
                Your browser does not support the video tag.
              </video>
            )
          )}

          {type === 'audio' && (
            <div className="w-full max-w-md flex flex-col items-center justify-center p-8 bg-white border border-gray-100 rounded-2xl space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 animate-pulse">
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
        </div>
      </div>
    </div>
  );
}

export default function DigitalDashboard() {
  const [tab, setTab] = useState<TabId>('SERMONS');
  const [sermons, setSermons] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);

  // Preview Modal State
  const [previewData, setPreviewData] = useState<{ isOpen: boolean; title: string; type: 'video' | 'audio' | 'pdf'; url: string }>({
    isOpen: false,
    title: '',
    type: 'video',
    url: ''
  });

  const fetchData = () => {
    digitalService.getSermons().then(setSermons).catch(console.error);
    digitalService.getConfig().then(setConfig).catch(console.error);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddSermon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await digitalService.createSermon({
        title: formData.get('title'),
        preacher: formData.get('preacher'),
        date: formData.get('date'),
        videoUrl: formData.get('videoUrl') || undefined,
        audioUrl: formData.get('audioUrl') || undefined,
        description: formData.get('description') || undefined,
      });
      form.reset();
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleSaveConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await digitalService.updateConfig({
        liveStreamUrl: formData.get('liveStreamUrl'),
        socialWebhookUrl: formData.get('socialWebhookUrl'),
        autoPostSermons: formData.get('autoPostSermons') === 'on',
      });
      alert('Konfigurasi disimpan');
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleGenerateKey = async () => {
    if (!confirm('Regenerate API Key? Key lama akan hangus.')) return;
    try { await digitalService.generateApiKey(); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const openPreview = (title: string, type: 'video' | 'audio' | 'pdf', url: string) => {
    setPreviewData({
      isOpen: true,
      title,
      type,
      url
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Globe className="w-8 h-8" /> Digital & Media
        </h1>
        <p className="mt-2 text-purple-100 max-w-2xl">Kelola arsip khotbah, warta jemaat digital, dan integrasi website / sosial media.</p>
      </div>

      <div className="flex border-b border-gray-200 bg-white rounded-t-2xl px-2 shadow-sm">
        {[
          { id: 'SERMONS', label: 'Arsip Khotbah', icon: Video },
          { id: 'INTEGRATIONS', label: 'Integrasi', icon: Globe }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as TabId)} className={`flex items-center gap-2 px-5 py-4 text-sm font-bold border-b-2 cursor-pointer ${tab === t.id ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-b-2xl shadow-sm min-h-[400px]">
        {tab === 'SERMONS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 border border-gray-100 rounded-xl p-5 bg-gray-50">
              <h3 className="font-bold mb-4">Tambah Khotbah Baru</h3>
              <form onSubmit={handleAddSermon} className="space-y-4">
                <input name="title" required placeholder="Judul Khotbah" className="w-full px-3 py-2 border rounded-lg text-sm bg-white" />
                <input name="preacher" required placeholder="Nama Pengkhotbah" className="w-full px-3 py-2 border rounded-lg text-sm bg-white" />
                <input name="date" required type="date" className="w-full px-3 py-2 border rounded-lg text-sm bg-white" />
                <input name="videoUrl" placeholder="Link Video (e.g. YouTube / MP4)" className="w-full px-3 py-2 border rounded-lg text-sm bg-white" />
                <input name="audioUrl" placeholder="Link Audio (e.g. MP3 / M4A)" className="w-full px-3 py-2 border rounded-lg text-sm bg-white" />
                <textarea name="description" rows={3} placeholder="Deskripsi Khotbah..." className="w-full px-3 py-2 border rounded-lg text-sm bg-white resize-none" />
                <button className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"><Plus className="w-4 h-4"/> Simpan Khotbah</button>
              </form>
            </div>
            <div className="md:col-span-2 space-y-3">
              {sermons.map(s => (
                <div key={s.id} className="border border-gray-100 p-4 rounded-xl flex justify-between items-center bg-white shadow-sm hover:border-purple-200 transition-all">
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-900 text-lg">{s.title}</h4>
                    <p className="text-xs text-gray-500">{new Date(s.date).toLocaleDateString('id-ID')} • {s.preacher}</p>
                    {s.description && <p className="text-xs text-gray-600 max-w-lg mt-1 italic">{s.description}</p>}
                    
                    <div className="flex gap-2 pt-2">
                      {s.videoUrl && (
                        <button
                          onClick={() => openPreview(s.title, 'video', s.videoUrl)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 border border-blue-100"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Preview Video
                        </button>
                      )}
                      {s.audioUrl && (
                        <button
                          onClick={() => openPreview(s.title, 'audio', s.audioUrl)}
                          className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1 border border-green-100"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          Play Audio
                        </button>
                      )}
                    </div>
                  </div>
                  <button onClick={() => digitalService.deleteSermon(s.id).then(fetchData)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              {sermons.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Belum ada arsip khotbah</p>}
            </div>
          </div>
        )}

        {tab === 'INTEGRATIONS' && config && (
          <div className="space-y-8 max-w-3xl">
            <div className="border border-gray-100 rounded-xl p-6 shadow-sm bg-white">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4"><Key className="w-5 h-5 text-purple-600" /> Website API Key</h3>
              <p className="text-sm text-gray-500 mb-4">Gunakan API Key ini untuk menarik data khotbah dan live stream ke website resmi gereja.</p>
              <div className="flex items-center gap-2">
                <input readOnly value={config.websiteApiKey || 'Belum di-generate'} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm text-gray-700" />
                <button onClick={handleGenerateKey} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer hover:bg-black transition-colors">Generate Ulang</button>
              </div>
            </div>

            <form onSubmit={handleSaveConfig} className="border border-gray-100 rounded-xl p-6 shadow-sm space-y-4 bg-white">
              <h3 className="font-bold text-gray-900 mb-2">Konfigurasi Integrasi</h3>
              
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Link Live Streaming Default (YouTube/Zoom)</label>
                <input name="liveStreamUrl" defaultValue={config.liveStreamUrl} placeholder="https://..." className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Social Media Webhook (Zapier/Make.com)</label>
                <input name="socialWebhookUrl" defaultValue={config.socialWebhookUrl} placeholder="https://hooks.zapier.com/..." className="w-full px-3 py-2 border rounded-lg text-sm" />
                <p className="text-xs text-gray-500 mt-1">Sistem akan menembakkan payload ke URL ini saat konten baru ditambahkan.</p>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" name="autoPostSermons" id="ap_sermon" defaultChecked={config.autoPostSermons} />
                <label htmlFor="ap_sermon" className="text-sm">Auto-post Khotbah Baru ke Webhook</label>
              </div>

              <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-bold cursor-pointer flex items-center gap-2 hover:bg-purple-700 transition-colors"><Save className="w-4 h-4"/> Simpan Konfigurasi</button>
            </form>
          </div>
        )}
      </div>

      {/* Preview Modal component */}
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
