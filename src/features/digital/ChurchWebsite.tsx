import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { 
  Video, BookOpen, Book, Calendar, FileText, Globe, Heart, 
  Phone, Mail, MapPin, ExternalLink, Play, Volume2, 
  ArrowRight, Eye, ChevronRight, X, Clock, User, Award, 
  CheckCircle, Radio
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

type SectionId = 'home' | 'devotion' | 'bible' | 'sermon' | 'bulletin' | 'events';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'video' | 'audio' | 'pdf';
  url: string;
  isDark?: boolean;
}

function PreviewModal({ isOpen, onClose, title, type, url, isDark = false }: PreviewModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border flex flex-col animate-in zoom-in-95 duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'
      }`}>
        <div className={`flex justify-between items-center p-5 border-b ${
          isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-gray-50/50 border-gray-100'
        }`}>
          <div>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded tracking-wider">
              {type} Preview
            </span>
            <h3 className={`text-lg font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors cursor-pointer ${
            isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-400 hover:bg-gray-100'
          }`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`p-6 flex-1 flex flex-col justify-center items-center ${
          isDark ? 'bg-slate-950/20' : 'bg-gray-50/50'
        }`}>
          {type === 'video' && (
            isYouTube ? (
              <iframe
                className="w-full aspect-video rounded-2xl shadow-lg border border-gray-200"
                src={embedUrl || ''}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video controls className="w-full aspect-video rounded-2xl shadow-lg border border-gray-200 bg-black">
                <source src={url} />
                Your browser does not support the video tag.
              </video>
            )
          )}

          {type === 'audio' && (
            <div className={`w-full max-w-md flex flex-col items-center justify-center p-8 border rounded-3xl space-y-4 shadow-md ${
              isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-gray-100'
            }`}>
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 animate-pulse">
                <Volume2 className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</p>
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
              className="w-full h-[60vh] rounded-2xl border border-gray-200 shadow-md bg-white"
              title={title}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChurchWebsite() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected details
  const [selectedDevotion, setSelectedDevotion] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Preview Modal
  const [previewData, setPreviewData] = useState<{ isOpen: boolean; title: string; type: 'video' | 'audio' | 'pdf'; url: string }>({
    isOpen: false,
    title: '',
    type: 'video',
    url: ''
  });

  useEffect(() => {
    if (tenantId) {
      setLoading(true);
      api.get(`/public/church/${tenantId}/website`)
        .then(res => {
          setData(res.data);
          setLoading(false);
          // Set initial devotion to today's devotion if available
          if (res.data.devotions && res.data.devotions.length > 0) {
            setSelectedDevotion(res.data.devotions[0]);
          }
        })
        .catch(err => {
          console.error(err);
          setError(err.response?.data?.error || 'Gagal memuat data website');
          setLoading(false);
        });
    }
  }, [tenantId]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold text-sm tracking-wide">Memuat Halaman Gereja...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 shadow-sm">
          <X className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Gereja Tidak Ditemukan</h1>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">{error || 'Maaf, data gereja tidak dapat ditemukan atau terjadi masalah.'}</p>
        </div>
        <Button onClick={() => navigate('/login')} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md">
          Kembali ke Login
        </Button>
      </div>
    );
  }

  const { tenant, config, sermons, bulletins, devotions, biblePlans, events } = data;

  // Resolve theme settings
  const getThemeConfig = (theme: string, defaultColor: string) => {
    switch (theme) {
      case 'dark':
        return { primary: '#6366f1', isDark: true };
      case 'emerald':
        return { primary: '#10b981', isDark: false };
      case 'amber':
        return { primary: '#d97706', isDark: false };
      case 'royal':
        return { primary: '#8b5cf6', isDark: false };
      case 'classic':
      default:
        return { primary: defaultColor || '#3b82f6', isDark: false };
    }
  };

  const themeConfig = getThemeConfig(tenant.websiteTheme || 'classic', tenant.primaryColor);
  const isDark = themeConfig.isDark;
  const primaryColor = themeConfig.primary;

  const handleOpenPreview = (title: string, type: 'video' | 'audio' | 'pdf', url: string) => {
    setPreviewData({
      isOpen: true,
      title,
      type,
      url
    });
  };

  return (
    <div 
      className={`min-h-screen flex flex-col selection:bg-indigo-100 relative font-sans transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'
      }`}
      style={{ '--theme-primary': primaryColor } as React.CSSProperties}
    >
      {/* Sticky Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300 ${
        isDark ? 'bg-slate-950/70 border-slate-900 text-white' : 'bg-white/70 border-gray-100 text-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant.logoUrl ? (
              <img src={tenant.logoUrl} alt={tenant.name} className="h-10 w-auto" />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] flex items-center justify-center font-black shadow-sm">
                <Globe className="w-5 h-5" />
              </div>
            )}
            <span className={`font-extrabold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{tenant.name}</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { id: 'home', label: 'Beranda' },
              { id: 'devotion', label: 'Saat Teduh' },
              { id: 'bible', label: 'Baca Alkitab' },
              { id: 'sermon', label: 'Khotbah' },
              { id: 'bulletin', label: 'Warta Jemaat' },
              { id: 'events', label: 'Kegiatan' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as SectionId);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeSection === item.id 
                    ? 'bg-[var(--theme-primary)] text-white shadow-md shadow-[var(--theme-primary)]/20' 
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Call To Action */}
          <div>
            <a 
              href={`/give/${tenant.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white" />
              Beri Persembahan
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ==================== HOME SECTION ==================== */}
        {activeSection === 'home' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            {/* Hero Card */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-8 md:p-16 shadow-2xl shadow-slate-900/10 border border-slate-800">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.1),transparent)] pointer-events-none"></div>
              
              <div className="max-w-2xl space-y-6 relative z-10">
                {config?.liveStreamUrl && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse border border-red-500 shadow-md shadow-red-600/30">
                    <Radio className="w-3.5 h-3.5" />
                    Live Streaming
                  </div>
                )}
                
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  Selamat Datang di <br />
                  <span className="text-[var(--theme-primary)]">{tenant.name}</span>
                </h1>
                
                <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                  Mari bertumbuh bersama dalam iman, persekutuan, dan pelayanan kasih. Temukan warta jemaat, khotbah mingguan, renungan harian, dan program pembacaan Alkitab kami secara digital.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  {config?.liveStreamUrl && (
                    <a 
                      href={config.liveStreamUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/90 text-white font-bold rounded-2xl shadow-lg transition-all"
                    >
                      <Play className="w-5 h-5 fill-white" />
                      Ikuti Ibadah Online
                    </a>
                  )}
                  <button 
                    onClick={() => setActiveSection('devotion')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md border border-white/10 transition-all cursor-pointer"
                  >
                    Mulai Bersaat Teduh
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats / Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Daily Devotion Card */}
              <div className={`rounded-3xl p-6 border flex flex-col justify-between hover:shadow-md transition-all ${
                isDark ? 'bg-slate-900 border-slate-800/80 shadow-md shadow-black/10' : 'bg-white border-slate-100 shadow-sm'
              }`}>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Renungan Saat Teduh</h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sediakan waktu hening bersama Firman Tuhan untuk menuntun langkah Anda setiap hari.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveSection('devotion')} 
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 w-fit cursor-pointer"
                >
                  Baca Renungan <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Bible Plans Card */}
              <div className={`rounded-3xl p-6 border flex flex-col justify-between hover:shadow-md transition-all ${
                isDark ? 'bg-slate-900 border-slate-800/80 shadow-md shadow-black/10' : 'bg-white border-slate-100 shadow-sm'
              }`}>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                    <Book className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Rencana Baca Alkitab</h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ikuti program terstruktur membaca Alkitab harian untuk memperdalam pengenalan akan Kristus.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveSection('bible')} 
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-green-600 hover:text-green-700 w-fit cursor-pointer"
                >
                  Lihat Program <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Online Giving Card */}
              <div className={`rounded-3xl p-6 border flex flex-col justify-between hover:shadow-md transition-all ${
                isDark ? 'bg-slate-900 border-slate-800/80 shadow-md shadow-black/10' : 'bg-white border-slate-100 shadow-sm'
              }`}>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Persembahan Online</h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Salurkan persembahan, persepuluhan, atau donasi misi Anda secara aman, cepat, dan transparan.</p>
                  </div>
                </div>
                <a 
                  href={`/give/${tenant.id}`}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-rose-600 hover:text-rose-700 w-fit"
                >
                  Beri Sekarang <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Featured Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Today's Devotion Highlight */}
              {devotions && devotions.length > 0 && (
                <div className={`rounded-[2rem] p-8 border space-y-4 ${
                  isDark ? 'bg-slate-900 border-slate-800/80 shadow-md shadow-black/10' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 font-bold text-xs rounded-lg uppercase tracking-wider ${
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      Renungan Terkini
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(devotions[0].publishDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{devotions[0].title}</h3>
                  <p className="text-xs font-extrabold text-[var(--theme-primary)]">{devotions[0].scriptureReference}</p>
                  
                  {devotions[0].passageText && (
                    <blockquote className={`border-l-4 border-[var(--theme-primary)] pl-4 py-1 text-sm italic ${
                      isDark ? 'bg-slate-800/40 text-slate-300' : 'bg-slate-50/50 text-slate-500'
                    }`}>
                      "{devotions[0].passageText}"
                    </blockquote>
                  )}
                  
                  <p className={`text-sm leading-relaxed line-clamp-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {devotions[0].content}
                  </p>

                  <button 
                    onClick={() => {
                      setSelectedDevotion(devotions[0]);
                      setActiveSection('devotion');
                    }}
                    className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 pt-2 cursor-pointer"
                  >
                    Selengkapnya <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Latest Sermon Highlight */}
              {sermons && sermons.length > 0 && (
                <div className={`rounded-[2rem] p-8 border space-y-4 flex flex-col justify-between ${
                  isDark ? 'bg-slate-900 border-slate-800/80 shadow-md shadow-black/10' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 font-bold text-xs rounded-lg uppercase tracking-wider ${
                        isDark ? 'bg-slate-800 text-slate-300' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        Khotbah Terbaru
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(sermons[0].date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className={`text-2xl font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{sermons[0].title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                      <User className="w-4 h-4 text-indigo-500" />
                      <span>{sermons[0].preacher}</span>
                    </div>
                    {sermons[0].description && (
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{sermons[0].description}</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    {sermons[0].videoUrl && (
                      <button 
                        onClick={() => handleOpenPreview(sermons[0].title, 'video', sermons[0].videoUrl)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        Tonton Khotbah
                      </button>
                    )}
                    {sermons[0].audioUrl && (
                      <button 
                        onClick={() => handleOpenPreview(sermons[0].title, 'audio', sermons[0].audioUrl)}
                        className={`px-4 py-2 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                        Dengar Audio
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Church Location / Contact Info Footer-like Banner */}
            <div className={`rounded-[2rem] p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-white ${
              isDark ? 'bg-slate-900 border border-slate-800' : 'bg-slate-900'
            }`}>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wide">
                  <MapPin className="w-4 h-4" />
                  Alamat Gereja
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {tenant.address || 'Alamat belum dikonfigurasi.'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wide">
                  <Phone className="w-4 h-4" />
                  Hubungi Kami
                </div>
                <p className="text-slate-300 text-sm">
                  {tenant.phone || 'Nomor telepon belum diatur.'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wide">
                  <Mail className="w-4 h-4" />
                  Email Resmi
                </div>
                <p className="text-slate-300 text-sm">
                  {tenant.email || 'Email belum diatur.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== DEVOTION SECTION ==================== */}
        {activeSection === 'devotion' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Left/Main Column: Selected Devotion Content */}
            <div className="lg:col-span-2 space-y-6">
              {selectedDevotion ? (
                <div className={`rounded-[2rem] p-8 border space-y-6 ${
                  isDark ? 'bg-slate-900 border-slate-800 shadow-md shadow-black/10' : 'bg-white border-slate-100 shadow-md'
                }`}>
                  <div className={`flex justify-between items-center border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                    <div>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        SAAT TEDUH
                      </span>
                      <h2 className={`text-3xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedDevotion.title}</h2>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(selectedDevotion.publishDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-black text-indigo-500 uppercase tracking-widest block">NATS ALKITAB</span>
                    <p className={`font-extrabold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedDevotion.scriptureReference}</p>
                    {selectedDevotion.passageText && (
                      <blockquote className={`border-l-4 border-[var(--theme-primary)] pl-4 py-2 italic rounded-r-xl ${
                        isDark ? 'bg-slate-850/60 text-slate-300' : 'bg-slate-50/50 text-slate-500'
                      }`}>
                        "{selectedDevotion.passageText}"
                      </blockquote>
                    )}
                  </div>

                  <div className={`space-y-4 leading-relaxed text-base whitespace-pre-line ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {selectedDevotion.content}
                  </div>

                  <div className={`border-t pt-4 flex justify-between items-center text-xs text-slate-400 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                    <span className="font-bold">Penulis: {selectedDevotion.author}</span>
                  </div>
                </div>
              ) : (
                <div className={`rounded-[2rem] p-12 text-center text-slate-400 border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  Tidak ada renungan terpilih.
                </div>
              )}
            </div>

            {/* Right Column: Devotions List */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className={`font-black text-lg tracking-tight px-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Arsip Renungan</h3>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {devotions.map((d: any) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDevotion(d)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      selectedDevotion?.id === d.id 
                        ? 'bg-[var(--theme-primary)] text-white border-[var(--theme-primary)] shadow-lg shadow-[var(--theme-primary)]/25' 
                        : isDark
                          ? 'bg-slate-900 text-slate-200 border-slate-800/80 hover:border-[var(--theme-primary)]'
                          : 'bg-white text-slate-800 border-slate-100 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-[10px] font-bold uppercase ${selectedDevotion?.id === d.id ? 'text-white/80' : 'text-indigo-600'}`}>
                        {d.scriptureReference}
                      </span>
                      <span className={`text-[10px] ${selectedDevotion?.id === d.id ? 'text-white/60' : 'text-slate-400'}`}>
                        {new Date(d.publishDate).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <span className="font-bold text-sm leading-snug line-clamp-1">{d.title}</span>
                  </button>
                ))}
                {devotions.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-8">Belum ada renungan yang dipublish</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== BIBLE PLANS SECTION ==================== */}
        {activeSection === 'bible' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Left Column: List of Reading Plans */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className={`font-black text-lg tracking-tight px-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Program Rencana Bacaan</h3>
              <div className="space-y-3">
                {biblePlans.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p)}
                    className={`w-full text-left p-6 rounded-3xl border transition-all cursor-pointer flex flex-col gap-3 ${
                      selectedPlan?.id === p.id 
                        ? 'bg-[var(--theme-primary)] text-white border-[var(--theme-primary)] shadow-lg shadow-[var(--theme-primary)]/25' 
                        : isDark
                          ? 'bg-slate-900 text-slate-200 border-slate-800/80 hover:border-[var(--theme-primary)]'
                          : 'bg-white text-slate-800 border-slate-100 hover:border-indigo-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Book className="w-5 h-5" />
                      <span className="font-black text-sm leading-snug">{p.title}</span>
                    </div>
                    <p className={`text-xs line-clamp-2 leading-relaxed ${selectedPlan?.id === p.id ? 'text-white/80' : 'text-slate-500'}`}>
                      {p.description || 'Mari membaca Alkitab teratur setiap hari.'}
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit uppercase ${
                      selectedPlan?.id === p.id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {p.durationDays} HARI
                    </span>
                  </button>
                ))}
                {biblePlans.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-8">Belum ada program rencana baca Alkitab</p>
                )}
              </div>
            </div>

            {/* Right Column: Reading Plan Readings Details */}
            <div className="lg:col-span-2">
              {selectedPlan ? (
                <div className={`rounded-[2rem] p-8 border space-y-6 ${
                  isDark ? 'bg-slate-900 border-slate-800 shadow-md shadow-black/10' : 'bg-white border-slate-100 shadow-md'
                }`}>
                  <div className={`border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                    <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedPlan.title}</h2>
                    {selectedPlan.description && (
                      <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedPlan.description}</p>
                    )}
                  </div>

                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Bacaan Harian</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedPlan.days.map((day: any) => (
                      <div key={day.id} className={`p-4 border rounded-2xl flex flex-col justify-center gap-1 ${
                        isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/50 border-slate-100 shadow-sm'
                      }`}>
                        <span className="text-[10px] font-bold text-indigo-600">HARI KE-{day.dayNumber}</span>
                        <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{day.scripturePassage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={`rounded-[2rem] p-12 text-center border flex flex-col items-center justify-center space-y-3 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <Book className="w-10 h-10 text-slate-300" />
                  <p className="text-sm">Pilih program membaca Alkitab di sebelah kiri untuk melihat pembagian ayat harian.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== SERMON SECTION ==================== */}
        {activeSection === 'sermon' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Arsip Khotbah</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sermons.map((s: any) => (
                <div key={s.id} className={`rounded-3xl border flex flex-col justify-between hover:shadow-md hover:border-indigo-100 transition-all ${
                  isDark ? 'bg-slate-900 border-slate-850/80 shadow-sm' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {new Date(s.date).toLocaleDateString('id-ID')}
                      </span>
                      <h4 className={`font-bold text-lg leading-tight mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.title}</h4>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{s.preacher}</span>
                    </div>

                    {s.description && (
                      <p className={`text-xs line-clamp-3 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{s.description}</p>
                    )}
                  </div>

                  <div className={`px-6 py-4 border-t flex gap-2 ${
                    isDark ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50/50 border-slate-50'
                  }`}>
                    {s.videoUrl && (
                      <button 
                        onClick={() => handleOpenPreview(s.title, 'video', s.videoUrl)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Tonton
                      </button>
                    )}
                    {s.audioUrl && (
                      <button 
                        onClick={() => handleOpenPreview(s.title, 'audio', s.audioUrl)}
                        className={`px-3.5 py-2 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Audio
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {sermons.length === 0 && (
                <div className={`col-span-full rounded-3xl p-12 text-center text-slate-400 border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  Belum ada arsip khotbah publik yang diunggah.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== BULLETIN SECTION ==================== */}
        {activeSection === 'bulletin' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Warta Jemaat</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bulletins.map((b: any) => (
                <div key={b.id} className={`rounded-3xl border p-6 flex flex-col justify-between hover:shadow-md hover:border-indigo-100 transition-all gap-4 ${
                  isDark ? 'bg-slate-900 border-slate-850/80 shadow-sm' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {new Date(b.date).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <h3 className={`font-bold text-lg leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{b.title}</h3>
                    {b.content && (
                      <p className={`text-xs line-clamp-4 leading-relaxed whitespace-pre-line ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{b.content}</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {b.pdfUrl && (
                      <button 
                        onClick={() => handleOpenPreview(b.title, 'pdf', b.pdfUrl)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat PDF Warta
                      </button>
                    )}
                    {b.content && !b.pdfUrl && (
                      <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        Tersedia secara online
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {bulletins.length === 0 && (
                <div className={`col-span-full rounded-3xl p-12 text-center text-slate-400 border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  Belum ada warta jemaat publik yang diunggah.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== EVENTS SECTION ==================== */}
        {activeSection === 'events' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Kegiatan Mendatang</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((e: any) => (
                <div key={e.id} className={`rounded-3xl border p-6 flex flex-col justify-between hover:shadow-md hover:border-indigo-100 transition-all gap-4 ${
                  isDark ? 'bg-slate-900 border-slate-850/80 shadow-sm' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                      {e.type}
                    </span>
                    <h3 className={`font-bold text-lg leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{e.title}</h3>
                    {e.description && (
                      <p className={`text-xs line-clamp-3 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{e.description}</p>
                    )}

                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span>Mulai: {new Date(e.startDate).toLocaleString('id-ID')}</span>
                      </div>
                      {e.location && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <MapPin className="w-4 h-4 text-indigo-500" />
                          <span>Tempat: {e.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                    {e.isRegistrationOpen ? (
                      <a 
                        href={`/register-event/${e.id}`}
                        className="w-full text-center inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                      >
                        Daftar Kegiatan <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg flex items-center justify-center">
                        Pendaftaran Ditutup
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {events.length === 0 && (
                <div className={`col-span-full rounded-3xl p-12 text-center text-slate-400 border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  Belum ada kegiatan/event mendatang yang direncanakan.
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className={`text-xs border-t py-8 mt-12 transition-colors duration-300 ${
        isDark ? 'bg-slate-950 border-slate-900 text-slate-600' : 'bg-slate-900 text-slate-500 border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-slate-400 font-bold">&copy; {new Date().getFullYear()} {tenant.name}. Hak Cipta Dilindungi.</p>
          <p className="text-slate-600 uppercase tracking-widest text-[10px] font-bold">Powered by Eklesia Church Management System</p>
        </div>
      </footer>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewData.isOpen}
        onClose={() => setPreviewData(prev => ({ ...prev, isOpen: false }))}
        title={previewData.title}
        type={previewData.type}
        url={previewData.url}
        isDark={isDark}
      />
    </div>
  );
}
