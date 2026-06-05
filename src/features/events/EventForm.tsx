import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { X, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface EventFormProps {
    isOpen: boolean;
    event?: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EventForm({ isOpen, event, onClose, onSuccess }: EventFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'SERVICE',
        startDate: '',
        endDate: '',
        location: '',
        capacity: '',
        isRegistrationOpen: true
    });

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title,
                description: event.description || '',
                type: event.type,
                startDate: new Date(event.startDate).toISOString().slice(0, 16),
                endDate: new Date(event.endDate).toISOString().slice(0, 16),
                location: event.location || '',
                capacity: event.capacity ? String(event.capacity) : '',
                isRegistrationOpen: event.isRegistrationOpen
            });
        } else {
            setFormData({
                title: '',
                description: '',
                type: 'SERVICE',
                startDate: new Date().toISOString().slice(0, 16),
                endDate: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
                location: '',
                capacity: '',
                isRegistrationOpen: true
            });
        }
    }, [event, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                capacity: formData.capacity ? parseInt(formData.capacity) : null
            };

            if (event) {
                await api.put(`/events/${event.id}`, payload);
            } else {
                await api.post('/events', payload);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || error.message;
            alert('Gagal menyimpan event: ' + errorMsg);
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-lg">
                        {event ? 'Edit Event' : 'Create New Event'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                        <input
                            required type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="SERVICE">Sunday Service</option>
                                <option value="SEMINAR">Seminar</option>
                                <option value="RETREAT">Retreat</option>
                                <option value="CONCERT">Concert</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Optional)</label>
                            <input
                                type="number" min="1"
                                placeholder="Unlimited if empty"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input
                                required type="datetime-local"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <input
                                required type="datetime-local"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                            type="text"
                            placeholder="e.g. Main Hall"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        ></textarea>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                        <input
                            type="checkbox"
                            id="isOpen"
                            checked={formData.isRegistrationOpen}
                            onChange={(e) => setFormData({ ...formData, isRegistrationOpen: e.target.checked })}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="isOpen" className="text-sm font-medium text-gray-700">Open for Online Registration</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            <Save className="w-4 h-4 mr-2" />
                            Save Event
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
