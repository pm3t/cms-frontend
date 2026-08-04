import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Users, Plus, ChevronRight, UserPlus, Trash2, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import Select from 'react-select';

export default function MinistryGroups() {
    const [groups, setGroups] = useState<any[]>([]);
    const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
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
    const [selectedMinistryDetails, setSelectedMinistryDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

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

    const openManageMembersModal = async (group: any) => {
        setSelectedMinistryId(group.id);
        setIsManageMembersOpen(true);
        setLoadingDetails(true);
        try {
            const res = await api.get(`/ministry/${group.id}`);
            setSelectedMinistryDetails(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to load ministry details');
        } finally {
            setLoadingDetails(false);
        }
    };

    const refreshMinistryDetails = async (id: string) => {
        try {
            const res = await api.get(`/ministry/${id}`);
            setSelectedMinistryDetails(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddMemberToGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!memberId) {
            alert('Please select a member first');
            return;
        }
        try {
            await api.post('/ministry/members', { 
                ministryId: selectedMinistryId, 
                memberId, 
                role 
            });
            setMemberId('');
            setRole('MEMBER');
            refreshMinistryDetails(selectedMinistryId);
            fetchGroups();
        } catch (err: any) {
            alert('Failed to add member: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleRemoveMember = async (targetMemberId: string) => {
        if (!window.confirm('Are you sure you want to remove this member from the group?')) return;
        try {
            await api.delete(`/ministry/${selectedMinistryId}/members/${targetMemberId}`);
            refreshMinistryDetails(selectedMinistryId);
            fetchGroups();
        } catch (err: any) {
            alert('Failed to remove member: ' + (err.response?.data?.error || err.message));
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
                    <div 
                        key={group.id} 
                        onClick={() => openManageMembersModal(group)}
                        className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer group"
                    >
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
                                    openManageMembersModal(group);
                                }}
                                className="p-1.5 bg-gray-50 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                title="Manage Members"
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

            {/* Modal Manage Members */}
            {isManageMembersOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col max-h-[85vh]">
                        {/* Modal Header */}
                        <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    Manage Members
                                </h3>
                                <p className="text-sm text-gray-505 mt-1">
                                    Group: <span className="font-semibold text-gray-700">{groups.find(g => g.id === selectedMinistryId)?.name}</span>
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsManageMembersOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body / Member List */}
                        <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-[200px]">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Registered Members ({selectedMinistryDetails?.members?.length || 0})</h4>
                            
                            {loadingDetails ? (
                                <div className="flex flex-col items-center justify-center py-8 space-y-2">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm text-gray-500">Loading members list...</p>
                                </div>
                            ) : !selectedMinistryDetails?.members || selectedMinistryDetails.members.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <Users className="w-8 h-8 text-gray-300 mb-2" />
                                    <p className="text-sm font-medium text-gray-900">No members registered</p>
                                    <p className="text-xs text-gray-500 mt-1">Use the section below to add a member.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                                    {selectedMinistryDetails.members.map((m: any) => (
                                        <div key={m.id} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold uppercase">
                                                    {m.member?.firstName?.[0] || ''}{m.member?.lastName?.[0] || ''}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{m.member?.firstName} {m.member?.lastName}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{m.member?.email || 'No email'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                                                    m.role === 'LEADER' ? 'bg-amber-50 text-amber-700 border border-amber-200/50' : 
                                                    m.role === 'STAFF' ? 'bg-purple-50 text-purple-700 border border-purple-200/50' : 
                                                    m.role === 'VOLUNTEER' ? 'bg-teal-50 text-teal-700 border border-teal-200/50' : 
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {m.role}
                                                </span>
                                                <button 
                                                    onClick={() => handleRemoveMember(m.memberId)}
                                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove member"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer / Add Member Form */}
                        <div className="pt-4 border-t border-gray-100 bg-white">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Add Member</h4>
                            <form onSubmit={handleAddMemberToGroup} className="flex flex-col gap-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Select Member</label>
                                        <Select 
                                            options={members
                                                .filter(m => !selectedMinistryDetails?.members?.some((sm: any) => sm.memberId === m.id))
                                                .map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }))
                                            }
                                            value={members.find(m => m.id === memberId) ? { value: memberId, label: `${members.find(m => m.id === memberId)?.firstName} ${members.find(m => m.id === memberId)?.lastName}` } : null}
                                            onChange={(selected: any) => setMemberId(selected ? selected.value : '')}
                                            isClearable
                                            placeholder="Search name..."
                                            className="text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Role</label>
                                        <select 
                                            required 
                                            value={role} 
                                            onChange={e => setRole(e.target.value)} 
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="MEMBER">Member</option>
                                            <option value="LEADER">Leader</option>
                                            <option value="STAFF">Staff</option>
                                            <option value="VOLUNTEER">Volunteer</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end mt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsManageMembersOpen(false)} className="text-sm">
                                        Close
                                    </Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-sm">
                                        Add to Group
                                    </Button>
                                </div>
                            </form>
                        </div>
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
