import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MapPin } from 'lucide-react';
import api from '../../lib/axios';
import LocationPickerModal from '../members/LocationPickerModal';

export default function ChurchProfileForm() {
    const [formData, setFormData] = useState<{
        name: string;
        address: string;
        phone: string;
        email: string;
        latitude: number | null;
        longitude: number | null;
    }>({
        name: '',
        address: '',
        phone: '',
        email: '',
        latitude: null,
        longitude: null,
    });
    const [loading, setLoading] = useState(true);
    const [pickerOpen, setPickerOpen] = useState(false);

    const fetchProfile = () => {
        setLoading(true);
        api.get('/tenant/profile').then(res => {
            setFormData({
                name: res.data.name || '',
                address: res.data.address || '',
                phone: res.data.phone || '',
                email: res.data.email || '',
                latitude: res.data.latitude ?? null,
                longitude: res.data.longitude ?? null,
            });
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            delete (payload as any).name;

            await api.patch('/tenant/profile', payload);
            alert('Profil gereja & koordinat peta berhasil disimpan!');
        } catch (err: any) {
            alert('Gagal update profil: ' + (err.response?.data?.error || err.message || 'Unknown error'));
        }
    };

    const handleSaveLocation = async (locData: any) => {
        setFormData(prev => ({
            ...prev,
            latitude: locData.latitude,
            longitude: locData.longitude,
            address: locData.address || prev.address,
        }));
    };

    if (loading) return <div className="animate-pulse flex space-x-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></div>;

    return (
        <>
            <form onSubmit={handleSave} className="space-y-6 max-w-2xl bg-white/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4">Church Profile & Location</h3>

                <Input label="Church Name (Read Only)" type="text" value={formData.name} disabled />
                <Input label="Headquarters Address" type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="123 Main St, City" />
                
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Contact Phone" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+62 812..." />
                    <Input label="General Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="hello@church.com" />
                </div>

                {/* Map Coordinates Section */}
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-blue-900 flex items-center">
                                <MapPin className="w-4 h-4 mr-1.5 text-blue-600" />
                                Lokasi Peta Gereja Pusat (HQ Pin)
                            </h4>
                            <p className="text-xs text-blue-700 mt-0.5">
                                Titik ini digunakan sebagai jangkar pusat pada modul Peta Sebaran Jemaat.
                            </p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                            Tetapkan di Peta
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Latitude (Lintang)</label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.latitude !== null ? formData.latitude : ''}
                                onChange={e => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : null })}
                                placeholder="e.g. -6.2088"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Longitude (Bujur)</label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.longitude !== null ? formData.longitude : ''}
                                onChange={e => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : null })}
                                placeholder="e.g. 106.8456"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <Button type="submit">Save Profile</Button>
                </div>
            </form>

            <LocationPickerModal
                isOpen={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSave={handleSaveLocation}
                initialData={{
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    address: formData.address,
                    name: formData.name || 'Gereja Pusat'
                }}
            />
        </>
    );
}
