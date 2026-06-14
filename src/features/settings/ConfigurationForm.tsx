import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';

export default function ConfigurationForm() {
    const [formData, setFormData] = useState({ timezone: 'Asia/Jakarta', currency: 'IDR', language: 'id' });
    const [ageRules, setAgeRules] = useState<any[]>([
        { category: 'CHILDREN', minAge: 0, maxAge: 12, label: 'Anak' },
        { category: 'YOUTH', minAge: 13, maxAge: 20, label: 'Remaja/Youth' },
        { category: 'ADULT', minAge: 21, maxAge: 59, label: 'Dewasa' },
        { category: 'ELDERLY', minAge: 60, maxAge: 150, label: 'Lansia' }
    ]);

    const user = useAuthStore(state => state.user);
    const tenantId = user?.organization_id || 'global';

    const [pageSize, setPageSize] = useState(() => localStorage.getItem(`pageSize_${tenantId}`) || '10');

    useEffect(() => {
        api.get('/tenant/profile').then(res => {
            setFormData({
                timezone: res.data.timezone || 'Asia/Jakarta',
                currency: res.data.currency || 'IDR',
                language: res.data.language || 'id'
            });
            if (res.data.ageGroupRules && Array.isArray(res.data.ageGroupRules) && res.data.ageGroupRules.length > 0) {
                setAgeRules(res.data.ageGroupRules);
            }
        });
    }, []);

    const handleRuleChange = (idx: number, key: string, value: any) => {
        setAgeRules(prev => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], [key]: value };
            return copy;
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.patch('/tenant/profile', {
                ...formData,
                ageGroupRules: ageRules
            });
            // Save local client setting
            localStorage.setItem(`pageSize_${tenantId}`, pageSize);

            alert('Configuration updated successfully!');
            window.location.reload(); // Refresh to apply changes across app
        } catch (err) {
            alert('Config Update failed.');
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-6 max-w-2xl bg-white/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4">System Preferences</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Timezone</label>
                    <select value={formData.timezone} onChange={e => setFormData({ ...formData, timezone: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                        <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                        <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                        <option value="UTC">UTC</option>
                    </select>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Base Currency</label>
                    <select value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="IDR">IDR - Indonesian Rupiah</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="SGD">SGD - Singapore Dollar</option>
                    </select>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">System Language</label>
                    <select value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="id">Bahasa Indonesia</option>
                        <option value="en">English</option>
                    </select>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Records per page (Tables)</label>
                    <select value={pageSize} onChange={e => setPageSize(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="10">10 records</option>
                        <option value="20">20 records</option>
                        <option value="50">50 records</option>
                        <option value="All">All records</option>
                    </select>
                </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4 pt-6">Kategori Kelompok Umur</h3>
            <p className="text-sm text-gray-500">Sesuaikan rentang umur untuk setiap kategori jemaat di gereja Anda. Perubahan akan mempengaruhi penentuan kategori otomatis berdasarkan tanggal lahir.</p>
            
            <div className="space-y-4">
                {ageRules.map((rule, idx) => (
                    <div key={rule.category} className="grid grid-cols-4 gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="font-semibold text-gray-700 text-sm">{rule.category}</div>
                        <div>
                            <label className="text-[11px] text-gray-500 block mb-0.5">Label (Tampilan)</label>
                            <input 
                                type="text"
                                className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary-500"
                                value={rule.label}
                                onChange={e => handleRuleChange(idx, 'label', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] text-gray-500 block mb-0.5">Min Umur</label>
                            <input 
                                type="number"
                                className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary-500"
                                value={rule.minAge}
                                onChange={e => handleRuleChange(idx, 'minAge', parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] text-gray-500 block mb-0.5">Max Umur</label>
                            <input 
                                type="number"
                                className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary-500"
                                value={rule.maxAge}
                                onChange={e => handleRuleChange(idx, 'maxAge', parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-4">
                <Button variant="secondary" type="submit">Save Preferences</Button>
            </div>
        </form>
    );
}
