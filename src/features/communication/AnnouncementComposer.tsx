import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { X, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';


interface AnnouncementComposerProps {
    isOpen: boolean;
    initialData?: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AnnouncementComposer({ isOpen, initialData, onClose, onSuccess }: AnnouncementComposerProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [audience, setAudience] = useState('ALL');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setContent(initialData.content);
            setAudience(initialData.audience);
        } else {
            setTitle('');
            setContent('');
            setAudience('ALL');
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { title, content, audience };
            if (initialData) {
                await api.put(`/announcements/${initialData.id}`, payload);
            } else {
                await api.post('/announcements', payload);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            alert('Gagal menyimpan pengumuman: ' + (error.response?.data?.error || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit Announcement' : 'Compose Announcement'}
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            placeholder="e.g. Easter Sunday Schedule"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                        <select
                            value={audience}
                            onChange={e => setAudience(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        >
                            <option value="ALL">All Congregation (Public)</option>
                            <option value="MEMBERS">Verified Members Only</option>
                            <option value="LEADERS">Church Leaders & Staff Only</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                        <textarea
                            required
                            rows={8}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none resize-y"
                            placeholder="Write the announcement details here..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>
                            <Send className="w-4 h-4 mr-2" />
                            {initialData ? 'Save Changes' : 'Broadcast Now'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
