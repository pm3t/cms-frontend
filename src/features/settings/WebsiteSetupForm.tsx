import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';
import { Globe, ShieldAlert, CheckCircle, ExternalLink } from 'lucide-react';

export default function WebsiteSetupForm() {
    const [formData, setFormData] = useState({ websiteActive: false, websitePath: '', websiteTheme: 'classic' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const baseUrl = window.location.origin;

    const themes = [
        { id: 'classic', name: 'Classic Blue', desc: 'Desain bersih dengan aksen biru laut.', color: 'bg-blue-500', bg: 'bg-white' },
        { id: 'dark', name: 'Midnight Dark', desc: 'Desain gelap modern dengan aksen neon.', color: 'bg-indigo-500', bg: 'bg-slate-900' },
        { id: 'emerald', name: 'Emerald Oasis', desc: 'Segar dan menenangkan dengan aksen hijau.', color: 'bg-emerald-500', bg: 'bg-white' },
        { id: 'amber', name: 'Warm Amber', desc: 'Nuansa hangat dan ramah dengan aksen jingga.', color: 'bg-amber-500', bg: 'bg-white' },
        { id: 'royal', name: 'Royal Velvet', desc: 'Kesan anggun dan megah dengan aksen ungu.', color: 'bg-purple-500', bg: 'bg-white' }
    ];

    useEffect(() => {
        api.get('/tenant/profile')
            .then(res => {
                setFormData({
                    websiteActive: res.data.websiteActive || false,
                    websitePath: res.data.id || '', // Lock to tenant ID
                    websiteTheme: res.data.websiteTheme || 'classic'
                });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        setSaving(true);
        try {
            await api.patch('/tenant/profile', {
                websiteActive: formData.websiteActive,
                websiteTheme: formData.websiteTheme
            });
            alert('Konfigurasi website berhasil diperbarui!');
            setSaving(false);
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Gagal menyimpan konfigurasi';
            alert('Error: ' + (Array.isArray(msg) ? JSON.stringify(msg) : msg));
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-gray-500 font-medium py-6 text-sm">Memuat data...</div>;
    }

    return (
        <form onSubmit={handleSave} className="space-y-6 max-w-2xl bg-white/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <Globe className="w-6 h-6 text-primary-600" />
                <h3 className="text-xl font-bold text-gray-800">Public Website Setup</h3>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
                Aktifkan website publik untuk menampilkan khotbah, warta jemaat digital, renungan harian, dan event ibadah Anda langsung kepada jemaat dan masyarakat umum.
            </p>

            <div className="space-y-6">
                {/* Website Active Switch */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                        <label className="font-bold text-slate-800 text-sm block">Aktifkan Website Publik</label>
                        <span className="text-xs text-gray-400">Jika dinonaktifkan, halaman publik tidak akan bisa diakses.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.websiteActive} 
                            onChange={e => setFormData({ ...formData, websiteActive: e.target.checked })}
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                </div>

                {/* Subpath Routing */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Path URL Website</label>
                    <div className="flex rounded-xl shadow-sm border border-gray-200 bg-gray-100 overflow-hidden">
                        <span className="inline-flex items-center px-4 bg-gray-200 text-gray-500 text-xs font-semibold select-none border-r border-gray-300">
                            {baseUrl}/website/
                        </span>
                        <input 
                            type="text" 
                            value={formData.websitePath} 
                            disabled
                            className="w-full px-4 py-2.5 outline-none text-sm font-semibold text-gray-500 bg-gray-50 cursor-not-allowed"
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        Path website dikunci menggunakan ID unik gereja Anda (<code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600 font-mono">{formData.websitePath}</code>) untuk menghindari bentrok dengan gereja lain.
                    </p>
                </div>

                {/* Theme Selection */}
                {formData.websiteActive && (
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Pilihan Tema Website</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {themes.map(t => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, websiteTheme: t.id })}
                                    className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                        formData.websiteTheme === t.id
                                            ? 'border-primary-600 bg-primary-50/10 ring-2 ring-primary-500/20'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 shrink-0 ${t.bg}`}>
                                        <div className={`w-4 h-4 rounded-full ${t.color}`}></div>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-sm text-slate-800">{t.name}</h4>
                                        <p className="text-xs text-gray-400 leading-normal">{t.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Public Link Helper */}
                {formData.websiteActive && formData.websitePath && (
                    <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-green-700 font-bold text-xs">
                            <CheckCircle className="w-4 h-4" />
                            Website Anda Aktif & Siap Diakses!
                        </div>
                        <p className="text-xs text-slate-600">Jemaat dapat mengakses website gereja Anda secara publik melalui link di bawah ini:</p>
                        <a 
                            href={`/website/${formData.websitePath}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary-600 hover:text-primary-700 mt-1"
                        >
                            {baseUrl}/website/{formData.websitePath}
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                )}
            </div>

            <div className="pt-4">
                <Button 
                    type="submit" 
                    disabled={saving}
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                    {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                </Button>
            </div>
        </form>
    );
}
