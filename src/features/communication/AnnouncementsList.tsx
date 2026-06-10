import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Megaphone, Plus, Trash2, Edit } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import AnnouncementComposer from './AnnouncementComposer';

export default function AnnouncementsList() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);

    const fetchAnnouncements = () => {
        setLoading(true);
        api.get('/announcements')
            .then(res => setAnnouncements(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus pengumuman ini?')) return;
        try {
            await api.delete(`/announcements/${id}`);
            fetchAnnouncements();
        } catch (err) {
            alert('Gagal menghapus pengumuman');
        }
    };

    const handleEdit = (ann: any) => {
        setEditingAnnouncement(ann);
        setIsComposerOpen(true);
    };

    const handleCloseComposer = () => {
        setIsComposerOpen(false);
        setEditingAnnouncement(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-primary-500 pb-1 inline-block">
                        Church Announcements
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">Manage broadcasted news and updates for your congregation.</p>
                </div>
                <Button onClick={() => setIsComposerOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Announcement
                </Button>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading announcements...</div>
                ) : announcements.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No Announcements</h3>
                        <p className="text-gray-500 mt-1">Create an announcement to broadcast news to the church.</p>
                        <Button className="mt-4" onClick={() => setIsComposerOpen(true)} variant="outline">
                            Create First Announcement
                        </Button>
                    </div>
                ) : (
                    announcements.map((ann) => (
                        <div key={ann.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-primary-100 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{ann.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Published on {new Date(ann.publishDate).toLocaleDateString()}
                                        {' • '} By {ann.author?.name || 'Admin'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 text-xs rounded-full font-medium bg-blue-50 text-blue-700">
                                        {ann.audience}
                                    </span>
                                    <button onClick={() => handleEdit(ann)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(ann.id)} className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="text-gray-700 mt-4 text-sm prose max-w-none">
                                {ann.content}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isComposerOpen && (
                <AnnouncementComposer
                    isOpen={isComposerOpen}
                    initialData={editingAnnouncement}
                    onClose={handleCloseComposer}
                    onSuccess={fetchAnnouncements}
                />
            )}
        </div>
    );
}
