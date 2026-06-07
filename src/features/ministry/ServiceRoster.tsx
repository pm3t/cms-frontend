import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Calendar, Plus, Clock, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import SearchableMemberSelect from '../../components/ui/SearchableMemberSelect';

export default function ServiceRoster() {
    const [rosters, setRosters] = useState<any[]>([]);
    const [ministries, setMinistries] = useState<any[]>([]);
    const [worshipServices, setWorshipServices] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRosterId, setEditingRosterId] = useState<string | null>(null);
    
    // Form state
    const [ministryId, setMinistryId] = useState('');
    const [date, setDate] = useState('');
    const [worshipServiceId, setWorshipServiceId] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [positions, setPositions] = useState<{ role: string, memberId: string }[]>([{ role: '', memberId: '' }]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rRes, mRes, wsRes, memRes] = await Promise.all([
                api.get('/ministry/roster'),
                api.get('/ministry'),
                api.get('/attendance/services'), // Assuming worship services are here
                api.get('/members')
            ]);
            setRosters(rRes.data);
            setMinistries(mRes.data);
            setWorshipServices(wsRes.data || []);
            setMembers(memRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openCreateModal = () => {
        setEditingRosterId(null);
        setMinistryId('');
        setDate('');
        setWorshipServiceId('');
        setStartTime('');
        setEndTime('');
        setPositions([{ role: '', memberId: '' }]);
        setIsModalOpen(true);
    };

    const handleEditClick = (roster: any) => {
        setEditingRosterId(roster.id);
        setMinistryId(roster.ministryId);
        // Format date to YYYY-MM-DD
        const formattedDate = new Date(roster.date).toISOString().split('T')[0];
        setDate(formattedDate);
        setWorshipServiceId(roster.worshipServiceId || '');
        setStartTime(roster.startTime || '');
        setEndTime(roster.endTime || '');
        setPositions(roster.positions.map((p: any) => ({
            role: p.role,
            memberId: p.memberId || ''
        })));
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { 
                ministryId, 
                date, 
                worshipServiceId: worshipServiceId || null,
                startTime, 
                endTime, 
                positions 
            };

            if (editingRosterId) {
                await api.put(`/ministry/roster/${editingRosterId}`, payload);
            } else {
                await api.post('/ministry/roster', payload);
            }

            setIsModalOpen(false);
            setEditingRosterId(null);
            setPositions([{ role: '', memberId: '' }]);
            fetchData();
        } catch (err) {
            alert(editingRosterId ? 'Failed to update roster' : 'Failed to create roster');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this roster?')) return;
        try {
            await api.delete(`/ministry/roster/${id}`);
            fetchData();
        } catch (err) {
            alert('Failed to delete roster');
        }
    };

    const addPosition = () => setPositions([...positions, { role: '', memberId: '' }]);
    const removePosition = (index: number) => setPositions(positions.filter((_, idx) => idx !== index));
    const updatePosition = (index: number, field: string, value: string) => {
        const next = [...positions];
        (next[index] as any)[field] = value;
        setPositions(next);
    };

    const paginatedRosters = rosters.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Service Roster & Scheduling</h3>
                <Button onClick={openCreateModal} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Roster
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {paginatedRosters.map(roster => (
                    <div key={roster.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
                        <div className="md:w-64 bg-gray-50 p-6 border-r border-gray-100 flex flex-col justify-center items-center text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center mb-3">
                                <span className="text-[10px] font-black text-red-500 uppercase">{new Date(roster.date).toLocaleString('id-ID', { month: 'short' })}</span>
                                <span className="text-2xl font-black text-gray-900">{new Date(roster.date).getDate()}</span>
                            </div>
                            <h4 className="font-bold text-gray-900">{roster.ministry.name}</h4>
                            <div className="mt-3 space-y-1 text-xs text-gray-500">
                                <p className="flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> {roster.startTime} - {roster.endTime}</p>
                                <p className="flex items-center justify-center gap-1"><MapPin className="w-3 h-3" /> {roster.worshipService?.name || 'Main Hall'}</p>
                            </div>
                        </div>
                        <div className="flex-1 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Assigned Personnel</h5>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleEditClick(roster)}
                                        className="text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-lg transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(roster.id)}
                                        className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {roster.positions.map((pos: any) => (
                                    <div key={pos.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200">
                                            <User className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{pos.role}</p>
                                            <p className="font-bold text-gray-900 text-sm">{pos.member ? `${pos.member.firstName} ${pos.member.lastName || ''}` : 'UNASSIGNED'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Pagination 
                currentPage={currentPage}
                totalPages={Math.ceil(rosters.length / pageSize)}
                onPageChange={setCurrentPage}
                totalRecords={rosters.length}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
            />

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                            {editingRosterId ? 'Edit Service Roster' : 'Create Service Roster'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Ministry</label>
                                    <select 
                                        required 
                                        value={ministryId} 
                                        onChange={e => setMinistryId(e.target.value)} 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                                        disabled={!!editingRosterId}
                                    >
                                        <option value="">Select Ministry...</option>
                                        {ministries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Service / Event</label>
                                    <select value={worshipServiceId} onChange={e => setWorshipServiceId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                                        <option value="">General / None</option>
                                        {worshipServices.map(ws => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Date</label>
                                    <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Start Time</label>
                                    <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">End Time</label>
                                    <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Assign Positions</label>
                                    <Button type="button" variant="outline" size="sm" onClick={addPosition}>
                                        <Plus className="w-3 h-3 mr-1" /> Add Position
                                    </Button>
                                </div>
                                {positions.map((pos, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                                        <div className="col-span-5">
                                            <input 
                                                required
                                                placeholder="Role (e.g. Guitarist)"
                                                value={pos.role}
                                                onChange={e => updatePosition(idx, 'role', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div className="col-span-5">
                                            <SearchableMemberSelect 
                                                members={members}
                                                value={pos.memberId}
                                                onChange={value => updatePosition(idx, 'memberId', value)}
                                                placeholder="Choose Member..."
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => removePosition(idx)}
                                                className="w-full text-red-500 border-red-100 hover:bg-red-50 px-2 py-2"
                                                disabled={positions.length <= 1}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 mt-8">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
                                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                                    {editingRosterId ? 'Update Roster' : 'Save Roster'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
