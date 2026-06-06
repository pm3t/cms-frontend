import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';

export default function ConfigurationForm() {
    const [formData, setFormData] = useState({ timezone: 'Asia/Jakarta', currency: 'IDR', language: 'id' });

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
        });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.patch('/tenant/profile', formData);
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

            <div className="pt-4">
                <Button variant="secondary" type="submit">Save Preferences</Button>
            </div>
        </form>
    );
}
