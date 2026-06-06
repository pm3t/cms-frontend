import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../lib/axios';

export default function ChurchProfileForm() {
    const [formData, setFormData] = useState({ name: '', address: '', phone: '', email: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch profile
        api.get('/tenant/profile').then(res => {
            setFormData({
                name: res.data.name || '',
                address: res.data.address || '',
                phone: res.data.phone || '',
                email: res.data.email || ''
            });
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            delete (payload as any).name; // Name belongs to Organization root, updating it implies separate mechanism

            await api.patch('/tenant/profile', payload);
            alert('Profile updated successfully!');
        } catch (err: any) {
            alert('Update failed: ' + (err.message || 'Unknown error'));
        }
    };

    if (loading) return <div className="animate-pulse flex space-x-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></div>;

    return (
        <form onSubmit={handleSave} className="space-y-6 max-w-2xl bg-white/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4">Church Profile</h3>

            <Input label="Church Name (Read Only)" type="text" value={formData.name} disabled />
            <Input label="Headquarters Address" type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="123 Main St, City" />
            <div className="grid grid-cols-2 gap-4">
                <Input label="Contact Phone" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+62 812..." />
                <Input label="General Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="hello@church.com" />
            </div>

            <div className="pt-4">
                <Button type="submit">Save Profile</Button>
            </div>
        </form>
    );
}
