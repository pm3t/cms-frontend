import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, List, Edit2, Trash2 } from 'lucide-react';
import api from '../../lib/axios';

export default function ServiceManager() {
    const [services, setServices] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        dayOfWeek: 0,
        startTime: '08:00',
        location: ''
    });
    const [loading, setLoading] = useState(true);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await api.get('/attendance/services');
            setServices(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (service: any) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description || '',
            dayOfWeek: service.dayOfWeek,
            startTime: service.startTime || '08:00',
            location: service.location || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Hapus jadwal ibadah "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        try {
            await api.delete(`/attendance/services/${id}`);
            alert('Jadwal ibadah berhasil dihapus.');
            fetchServices();
        } catch (err: any) {
            alert('Gagal menghapus jadwal ibadah: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingService(null);
        setFormData({ name: '', description: '', dayOfWeek: 0, startTime: '08:00', location: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingService) {
                await api.patch(`/attendance/services/${editingService.id}`, formData);
                alert('Jadwal ibadah berhasil diperbarui.');
            } else {
                await api.post('/attendance/services', formData);
                alert('Jadwal ibadah baru berhasil ditambahkan.');
            }
            setShowForm(false);
            setEditingService(null);
            setFormData({ name: '', description: '', dayOfWeek: 0, startTime: '08:00', location: '' });
            fetchServices();
        } catch (err: any) {
            alert('Gagal menyimpan jadwal ibadah: ' + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Worship Services</h2>
                <button
                    onClick={() => {
                        if (showForm && editingService) {
                            setEditingService(null);
                            setFormData({ name: '', description: '', dayOfWeek: 0, startTime: '08:00', location: '' });
                        } else {
                            setShowForm(!showForm);
                        }
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Service
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">
                        {editingService ? 'Edit Worship Service' : 'Create Worship Service'}
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="e.g. Sunday Morning Worship"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                            <select
                                value={formData.dayOfWeek}
                                onChange={e => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none"
                            >
                                {days.map((day, i) => <option key={i} value={i}>{day}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none"
                                placeholder="Main Sanctuary"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <button type="button" onClick={handleCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                                {editingService ? 'Update Service' : 'Save Service'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                    <div key={service.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-primary-200 transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-gray-900">{service.name}</h3>
                                <span className="px-2 py-1 bg-primary-50 text-primary-700 text-[10px] font-bold uppercase rounded tracking-wider">RECURRING</span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    Every {days[service.dayOfWeek]}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    {service.startTime}
                                </div>
                                {service.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        {service.location}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 border-t pt-3 mt-3">
                            <button
                                onClick={() => handleEdit(service)}
                                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1 border border-gray-100"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(service.id, service.name)}
                                className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 border border-red-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && services.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                    <List className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No worship services defined yet.</p>
                </div>
            )}
        </div>
    );
}
