import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/axios';
import { Heart, CreditCard, ShieldCheck, Mail, User, Info } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function DonationPortal() {
    const { churchId } = useParams<{ churchId: string }>();
    const [church, setChurch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [amount, setAmount] = useState('');
    const [projectId, setProjectId] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (churchId) {
            api.get('/public/church/' + churchId)
                .then(res => {
                    setChurch(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [churchId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return alert('Masukkan nominal yang valid');
        
        setSubmitting(true);
        try {
            const res = await api.post('/public/church/' + churchId + '/give', {
                amount: parseFloat(amount),
                projectId: projectId || undefined,
                category: 'DONATION',
                description: description || 'Donasi umum',
                donorName: name,
                donorEmail: email
            });
            
            // Redirect to Xendit invoice
            if (res.data.invoiceUrl) {
                window.location.href = res.data.invoiceUrl;
            } else {
                throw new Error('Gagal membuat invoice pembayaran');
            }
        } catch (err: any) {
            alert('Gagal memproses donasi: ' + (err.response?.data?.error || err.message));
            setSubmitting(false);
        }
    };

    if (loading) return <div className="h-screen w-screen flex items-center justify-center font-bold text-gray-400">Loading Church Portal...</div>;
    if (!church) return <div className="h-screen w-screen flex items-center justify-center font-bold text-red-500 text-2xl">Church Not Found</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 selection:bg-blue-100">
            {/* Header / Brand */}
            <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
                {church.logoUrl ? (
                    <img src={church.logoUrl} alt={church.name} className="h-20 w-auto mx-auto mb-4" />
                ) : (
                    <div className="h-20 w-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Heart className="w-10 h-10 text-blue-600" />
                    </div>
                )}
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{church.name}</h1>
                <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">{church.address || 'Halaman Persembahan Online'}</p>
            </div>

            {/* Donation Card */}
            <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-700">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
                    <h2 className="text-2xl font-bold">Online Giving</h2>
                    <p className="opacity-80 text-sm mt-1">Donasi Anda sangat berarti bagi pelayanan kami.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Nominal Donasi (Rp)</label>
                        <div className="relative group">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300 group-focus-within:text-blue-500 transition-colors">Rp</span>
                            <input 
                                required
                                type="number" 
                                value={amount} 
                                onChange={e => setAmount(e.target.value)}
                                placeholder="0"
                                className="w-full pl-16 pr-6 py-5 text-3xl font-black bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Project Selection */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">Tujuan Donasi</label>
                            <div className="relative">
                                <select 
                                    value={projectId} 
                                    onChange={e => setProjectId(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                >
                                    <option value="">Donasi Umum</option>
                                    {church.donationProjects.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <Info className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Name Input */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">Nama Lengkap</label>
                            <div className="relative">
                                <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    required
                                    type="text" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Nama Anda"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500">Alamat Email (Untuk Tanda Terima)</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                required
                                type="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)}
                                placeholder="email@anda.com"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500">Catatan / Pesan (Opsional)</label>
                        <textarea 
                            rows={2}
                            value={description} 
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Tuliskan pesan atau doa..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                    </div>

                    <Button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {submitting ? 'Memproses...' : (
                            <div className="flex items-center justify-center">
                                <CreditCard className="w-5 h-5 mr-2" />
                                Bayar Sekarang
                            </div>
                        )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest pt-4">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        Secure Payment via Xendit
                    </div>
                </form>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-gray-400 text-xs">
                <p>&copy; {new Date().getFullYear()} {church.name}. Powered by Eklesia.</p>
            </div>
        </div>
    );
}
