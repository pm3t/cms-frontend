import React, { useState, useEffect } from 'react';
import { digitalService } from './digitalService';
import { devotionService } from './devotionService';
import { Video, FileText, Globe, Key, Trash2, Plus, Save, Play, Music, Volume2, Eye, X, BookOpen, Calendar, Book, Edit } from 'lucide-react';

type TabId = 'SERMONS' | 'DEVOTIONS' | 'BIBLE_PLANS' | 'INTEGRATIONS';

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
  const [devotions, setDevotions] = useState<any[]>([]);
  const [biblePlans, setBiblePlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  const [editingDevotion, setEditingDevotion] = useState<any>(null);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  // Preview Modal State
  const [previewData, setPreviewData] = useState<{ isOpen: boolean; title: string; type: 'video' | 'audio' | 'pdf'; url: string }>({
    isOpen: false,
    title: '',
    type: 'video',
    url: ''
  });

  const fetchData = () => {
    digitalService.getSermons().then(setSermons).catch(console.error);
    devotionService.getDevotions().then(setDevotions).catch(console.error);
    devotionService.getBiblePlans().then(setBiblePlans).catch(console.error);
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

  const handleSubmitDevotion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      title: formData.get('title'),
      scriptureReference: formData.get('scriptureReference'),
      passageText: formData.get('passageText') || undefined,
      content: formData.get('content'),
      author: formData.get('author') || undefined,
      publishDate: formData.get('publishDate'),
    };
    try {
      if (editingDevotion) {
        await devotionService.updateDevotion(editingDevotion.id, payload);
        setEditingDevotion(null);
      } else {
        await devotionService.createDevotion(payload);
      }
      form.reset();
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleSubmitBiblePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const rawPassages = formData.get('passages') as string;
    
    const passagesList = rawPassages
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
      
    if (passagesList.length === 0) {
      alert('Masukkan minimal satu pasal bacaan');
      return;
    }
    
    const payload = {
      title,
      description,
      durationDays: passagesList.length,
      days: passagesList.map((passage, index) => ({
        dayNumber: index + 1,
        scripturePassage: passage
      }))
    };
    
    try {
      if (editingPlan) {
        await devotionService.updateBiblePlan(editingPlan.id, payload);
        setEditingPlan(null);
      } else {
        await devotionService.createBiblePlan(payload);
      }
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
        <p className="mt-2 text-purple-100 max-w-2xl">Kelola arsip khotbah, warta jemaat digital, renungan harian saat teduh, dan rencana baca Alkitab.</p>
      </div>

      <div className="flex border-b border-gray-200 bg-white rounded-t-2xl px-2 shadow-sm overflow-x-auto">
        {[
          { id: 'SERMONS', label: 'Arsip Khotbah', icon: Video },
          { id: 'DEVOTIONS', label: 'Saat Teduh & Renungan', icon: BookOpen },
          { id: 'BIBLE_PLANS', label: 'Rencana Baca Alkitab', icon: Book },
          { id: 'INTEGRATIONS', label: 'Integrasi', icon: Globe }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as TabId)} className={`flex items-center gap-2 px-5 py-4 text-sm font-bold border-b-2 cursor-pointer whitespace-nowrap ${tab === t.id ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
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

        {tab === 'DEVOTIONS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 border border-gray-100 rounded-xl p-5 bg-gray-50">
              <h3 className="font-bold mb-4">{editingDevotion ? 'Edit Renungan Harian' : 'Tulis Renungan Harian'}</h3>
              <form 
                key={editingDevotion ? editingDevotion.id : 'new-devotion'} 
                onSubmit={handleSubmitDevotion} 
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Judul Renungan</label>
                  <input 
                    name="title" 
                    required 
                    defaultValue={editingDevotion?.title || ''} 
                    placeholder="Contoh: Mengakar dalam Kasih" 
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Nats Alkitab</label>
                    <input 
                      name="scriptureReference" 
                      required 
                      defaultValue={editingDevotion?.scriptureReference || ''} 
                      placeholder="Efesus 3:17-19" 
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Tanggal Tayang</label>
                    <input 
                      name="publishDate" 
                      required 
                      type="date" 
                      defaultValue={editingDevotion?.publishDate ? new Date(editingDevotion.publishDate).toISOString().substring(0, 10) : ''} 
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Teks Ayat Ayat (Opsional)</label>
                  <textarea 
                    name="passageText" 
                    rows={2} 
                    defaultValue={editingDevotion?.passageText || ''} 
                    placeholder="Teks ayat Alkitab lengkap..." 
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white resize-none" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Isi Renungan</label>
                  <textarea 
                    name="content" 
                    required 
                    rows={6} 
                    defaultValue={editingDevotion?.content || ''} 
                    placeholder="Tulis isi renungan harian di sini..." 
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white resize-none" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Penulis</label>
                  <input 
                    name="author" 
                    defaultValue={editingDevotion ? (editingDevotion.author || '') : 'Tim Pastoral'} 
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white" 
                  />
                </div>
                <div className="flex gap-2">
                  {editingDevotion && (
                    <button 
                      type="button" 
                      onClick={() => setEditingDevotion(null)} 
                      className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                    >
                      Batal
                    </button>
                  )}
                  <button className="flex-[2] bg-purple-600 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors">
                    {editingDevotion ? <Save className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                    {editingDevotion ? 'Simpan Perubahan' : 'Jadwalkan Renungan'}
                  </button>
                </div>
              </form>
            </div>
            <div className="md:col-span-2 space-y-3">
              <h3 className="font-bold text-gray-800 text-lg mb-2">Jadwal Renungan Terbit</h3>
              {devotions.map(d => (
                <div key={d.id} className="border border-gray-100 p-5 rounded-xl bg-white shadow-sm hover:border-purple-200 transition-all space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded border border-purple-100 uppercase tracking-wide">
                        Tanggal: {new Date(d.publishDate).toLocaleDateString('id-ID')}
                      </span>
                      <h4 className="font-bold text-gray-900 text-lg mt-1.5">{d.title}</h4>
                      <p className="text-xs text-gray-500 font-bold mt-0.5">{d.scriptureReference} • Ditulis oleh: {d.author}</p>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setEditingDevotion(d)} 
                        className="text-purple-600 p-2 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
                        title="Edit Renungan"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => devotionService.deleteDevotion(d.id).then(fetchData)} 
                        className="text-red-500 p-2 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                        title="Hapus Renungan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {d.passageText && <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg italic border-l-4 border-purple-300">"{d.passageText}"</p>}
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{d.content}</p>
                </div>
              ))}
              {devotions.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Belum ada jadwal renungan saat teduh</p>}
            </div>
          </div>
        )}

        {tab === 'BIBLE_PLANS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 border border-gray-100 rounded-xl p-5 bg-gray-50">
              <h3 className="font-bold mb-4">{editingPlan ? 'Edit Rencana Baca Alkitab' : 'Buat Rencana Baca Alkitab'}</h3>
              <form 
                key={editingPlan ? editingPlan.id : 'new-plan'} 
                onSubmit={handleSubmitBiblePlan} 
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Nama Program</label>
                  <input 
                    name="title" 
                    required 
                    defaultValue={editingPlan?.title || ''} 
                    placeholder="Contoh: Rencana Baca Kitab Injil 30 Hari" 
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Deskripsi Singkat</label>
                  <textarea 
                    name="description" 
                    rows={2} 
                    defaultValue={editingPlan?.description || ''} 
                    placeholder="Penjelasan tentang program ini..." 
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white resize-none" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Daftar Ayat Harian (Tiap Baris = 1 Hari)</label>
                  <textarea 
                    name="passages" 
                    required 
                    rows={10} 
                    defaultValue={editingPlan ? (editingPlan.days || []).map((d: any) => d.scripturePassage).join('\n') : ''} 
                    placeholder="Matius 1-2&#10;Matius 3-4&#10;Matius 5-7&#10;Matius 8-9" 
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white font-mono leading-relaxed" 
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Tulis satu pasal/ayat bacaan per baris. Jumlah baris akan otomatis dihitung menjadi jumlah hari durasi program.</p>
                </div>
                <div className="flex gap-2">
                  {editingPlan && (
                    <button 
                      type="button" 
                      onClick={() => setEditingPlan(null)} 
                      className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                    >
                      Batal
                    </button>
                  )}
                  <button className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors">
                    {editingPlan ? <Save className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                    {editingPlan ? 'Simpan Perubahan' : 'Simpan Rencana Bacaan'}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-bold text-gray-800 text-lg">Program Rencana Baca Alkitab</h3>
              <div className="grid grid-cols-1 gap-4">
                {biblePlans.map(p => (
                  <div key={p.id} className="border border-gray-100 p-5 rounded-xl bg-white shadow-sm hover:border-purple-200 transition-all flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                          <Book className="w-5 h-5 text-purple-600" /> {p.title}
                        </h4>
                        <p className="text-xs text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-100 w-fit mt-1">
                          Durasi: {p._count?.days || p.durationDays} Hari • Diikuti {p._count?.enrollments || 0} Jemaat
                        </p>
                        {p.description && <p className="text-sm text-gray-600 mt-2">{p.description}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => devotionService.getBiblePlanById(p.id).then(setEditingPlan).catch(console.error)} 
                          className="text-purple-600 p-2 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
                          title="Edit Rencana Bacaan"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => devotionService.deleteBiblePlan(p.id).then(fetchData)} 
                          className="text-red-500 p-2 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          title="Hapus Rencana Bacaan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (selectedPlan?.id === p.id) setSelectedPlan(null);
                        else devotionService.getBiblePlanById(p.id).then(setSelectedPlan).catch(console.error);
                      }}
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 mt-2 w-fit bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors border border-purple-100"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {selectedPlan?.id === p.id ? 'Sembunyikan Pembagian Ayat' : 'Lihat Pembagian Ayat Harian'}
                    </button>

                    {selectedPlan?.id === p.id && (
                      <div className="mt-4 border-t border-gray-100 pt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {selectedPlan.days.map((day: any) => (
                          <div key={day.id} className="p-2 border border-gray-50 rounded bg-gray-50/50 flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-gray-400">HARI KE-{day.dayNumber}</span>
                            <span className="text-xs font-bold text-gray-700">{day.scripturePassage}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {biblePlans.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Belum ada program rencana baca Alkitab</p>}
              </div>
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
