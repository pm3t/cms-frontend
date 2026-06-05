import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import axios from 'axios';
import { API_BASE_URL } from '../../lib/config';

export default function BrandingForm() {
    const [formData, setFormData] = useState({ primaryColor: '#3b82f6', logoUrl: '' });

    useEffect(() => {
        axios.get(`${API_BASE_URL}/tenant/profile`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => {
            setFormData({
                primaryColor: res.data.primaryColor || '#3b82f6',
                logoUrl: res.data.logoUrl || ''
            });
        });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.patch(`${API_BASE_URL}/tenant/profile`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Branding updated successfully! Color schemes will apply on next refresh.');
        } catch (err) {
            alert('Config Update failed.');
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-6 max-w-2xl bg-white/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4">Theme & Branding</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-3">Primary Theme Color</label>
                    <div className="flex items-center space-x-4">
                        <input type="color" value={formData.primaryColor} onChange={e => setFormData({ ...formData, primaryColor: e.target.value })} className="h-10 w-20 rounded cursor-pointer border border-gray-200" />
                        <span className="text-gray-500 font-mono text-sm">{formData.primaryColor}</span>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Company Logo URL</label>
                    <input type="url" value={formData.logoUrl} onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} placeholder="https://..." className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary-500" />
                    <p className="text-xs text-gray-500 mt-1">Provide a valid image url to show on the layout sidebar.</p>
                </div>
            </div>

            <div className="pt-4">
                <Button variant="outline" type="submit">Publish Theme</Button>
            </div>
        </form>
    );
}
