import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export default function SmallGroupDashboard() {
    const [groups, setGroups] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('CELL_GROUP');
    const [meetingSchedule, setMeetingSchedule] = useState('');
    const [location, setLocation] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = () => {
        api.get('/groups')
            .then(res => setGroups(res.data))
            .catch(console.error);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/groups', {
                name, description, type, meetingSchedule, location
            });
            setIsModalOpen(false);
            fetchGroups();
        } catch (err) {
            alert('Failed to create group');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this group?')) return;
        try {
            await api.delete(`/groups/${id}`);
            fetchGroups();
        } catch (err) {
            alert('Failed to delete group');
        }
    };

    const openNewModal = () => {
        setName('');
        setDescription('');
        setType('CELL_GROUP');
        setMeetingSchedule('');
        setLocation('');
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-primary-500 pb-1 inline-block">
                        Small Groups
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">Manage cell groups, fellowships, and ministries.</p>
                </div>
                <Button onClick={openNewModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Group
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map(g => (
                    <div key={g.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/small-groups/${g.id}`)}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-md mb-2 inline-block">
                                    {g.type.replace('_', ' ')}
                                </span>
                                <h3 className="font-semibold text-gray-900 text-lg">{g.name}</h3>
                            </div>
                            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                <button onClick={() => handleDelete(g.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{g.description || 'No description'}</p>
                        
                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-600">
                                <Users className="w-4 h-4 mr-1.5" />
                                <span>{g._count?.members || 0} Members</span>
                            </div>
                            {g.meetingSchedule && (
                                <span className="text-gray-500 truncate max-w-[120px]">{g.meetingSchedule}</span>
                            )}
                        </div>
                    </div>
                ))}
                {groups.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                        No small groups found. Click "New Group" to create one.
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">New Group</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full">✕</button>
                        </div>
                        <form onSubmit={handleSave} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                                    <option value="CELL_GROUP">Cell Group</option>
                                    <option value="FELLOWSHIP">Fellowship</option>
                                    <option value="COMMISSION">Commission</option>
                                    <option value="MINISTRY">Ministry</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Schedule</label>
                                <input type="text" value={meetingSchedule} onChange={e => setMeetingSchedule(e.target.value)} placeholder="e.g. Every Friday 19:00" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
