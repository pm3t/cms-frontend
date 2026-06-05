import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Users, Plus, ChevronRight, UserPlus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import Select from 'react-select';

export default function MinistryGroups() {
    const [groups, setGroups] = useState<any[]>([]);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMinistryId, setEditingMinistryId] = useState<string | null>(null);
    const [selectedMinistryId, setSelectedMinistryId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [memberId, setMemberId] = useState('');
    const [role, setRole] = useState('MEMBER');
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await api.get('/ministry');
            setGroups(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const res = await api.get('/members');
            setMembers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchGroups();
        fetchMembers();
    }, []);

    const handleSaveMinistry = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingMinistryId) {
                await api.put(`/ministry/${editingMinistryId}`, { name, description });
            } else {
                await api.post('/ministry', { name, description });
            }
            setIsModalOpen(false);
            setEditingMinistryId(null);
            setName('');
            setDescription('');
            fetchGroups();
        } catch (err) {
            alert('Failed to save ministry group');
        }
    };

    const handleDeleteMinistry = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this ministry group?')) return;
        try {
            await api.delete(`/ministry/${id}`);
            fetchGroups();
        } catch (err) {
            alert('Failed to delete ministry group');
        }
    };

    const openEditModal = (group: any) => {
        setEditingMinistryId(group.id);
        setName(group.name);
        setDescription(group.description || '');
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingMinistryId(null);
        setName('');
        setDescription('');
        setIsModalOpen(true);
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/ministry/members', { 
                ministryId: selectedMinistryId, 
                memberId, 
                role 
            });
            setIsAddMemberOpen(false);
            setMemberId('');
            setRole('MEMBER');
            fetchGroups();
        } catch (err: any) {
            alert('Failed to add member: ' + (err.response?.data?.error || err.message));
        }
    };

    const paginatedGroups = groups.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Ministry Groups</h3>
                <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Group
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedGroups.map(group => (
                    <div key={group.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Members</span>
                                <p className="text-xl font-bold text-gray-900">{group._count?.members || 0}</p>
                            </div>
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg">{group.name}</h4>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{group.description || 'No description provided.'}</p>
                        
                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="flex gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); openEditModal(group); }} 
                                    className="text-xs font-bold text-blue-600 hover:underline flex items-center"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteMinistry(group.id); }} 
                                    className="text-xs font-bold text-red-600 hover:underline flex items-center"
                                >
                                    Delete
                                </button>
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMinistryId(group.id);
                                    setIsAddMemberOpen(true);
                                }}
                                className="p-1.5 bg-gray-50 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Pagination 
                currentPage={currentPage}
                totalPages={Math.ceil(groups.length / pageSize)}
                onPageChange={setCurrentPage}
                totalRecords={groups.length}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
            />

            {/* Modal Add Member */}
            {isAddMemberOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Add Member to {groups.find(g => g.id === selectedMinistryId)?.name}</h3>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Select Member</label>
                                <Select 
                                    options={members.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }))}
                                    value={members.find(m => m.id === memberId) ? { value: memberId, label: `${members.find(m => m.id === memberId)?.firstName} ${members.find(m => m.id === memberId)?.lastName}` } : null}
                                    onChange={(selected: any) => setMemberId(selected ? selected.value : '')}
                                    isClearable
                                    placeholder="Search member by typing..."
                                    className="text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Role in Ministry</label>
                                <select 
                                    required 
                                    value={role} 
                                    onChange={e => setRole(e.target.value)} 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="MEMBER">Member</option>
                                    <option value="LEADER">Leader</option>
                                    <option value="STAFF">Staff</option>
                                    <option value="VOLUNTEER">Volunteer</option>
                                </select>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <Button type="button" variant="outline" onClick={() => setIsAddMemberOpen(false)} className="flex-1">Cancel</Button>
                                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">Add Member</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">{editingMinistryId ? 'Edit Ministry Group' : 'Create Ministry Group'}</h3>
                        <form onSubmit={handleSaveMinistry} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Group Name</label>
                                <input 
                                    required 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Worship Team"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Description</label>
                                <textarea 
                                    rows={3} 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Describe the purpose of this ministry..."
                                />
                            </div>
                            <div className="flex gap-3 mt-8">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
                                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">{editingMinistryId ? 'Save Changes' : 'Create Group'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
