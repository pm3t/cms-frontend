import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, Users, Trash2, Edit2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import Select from 'react-select';
import api from '../../lib/axios';

export default function GroupDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [group, setGroup] = useState<any>(null);
    const [allMembers, setAllMembers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'MEMBERS' | 'MEETINGS'>('MEMBERS');

    // Add Member Modal
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState('');
    const [selectedRole, setSelectedRole] = useState('MEMBER');

    // Add Meeting Modal
    const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
    const [meetingDate, setMeetingDate] = useState('');
    const [meetingTitle, setMeetingTitle] = useState('');

    useEffect(() => {
        fetchGroup();
        fetchAllMembers();
    }, [id]);

    const fetchGroup = () => {
        api.get(`/groups/${id}`)
            .then(res => setGroup(res.data))
            .catch(console.error);
    };

    const fetchAllMembers = () => {
        api.get('/members')
            .then(res => setAllMembers(res.data))
            .catch(console.error);
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/groups/${id}/members`, {
                memberId: selectedMember,
                role: selectedRole
            });
            setIsAddMemberOpen(false);
            fetchGroup();
        } catch (err) {
            alert('Failed to add member');
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Remove this member from the group?')) return;
        try {
            await api.delete(`/groups/${id}/members/${memberId}`);
            fetchGroup();
        } catch (err) {
            alert('Failed to remove member');
        }
    };

    const handleChangeRole = async (memberId: string, role: string) => {
        try {
            await api.put(`/groups/${id}/members/${memberId}/role`, { role });
            fetchGroup();
        } catch (err) {
            alert('Failed to update role');
        }
    };

    const handleCreateMeeting = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/groups/${id}/meetings`, {
                date: new Date(meetingDate).toISOString(),
                title: meetingTitle
            });
            setIsAddMeetingOpen(false);
            fetchGroup();
        } catch (err) {
            alert('Failed to create meeting');
        }
    };

    if (!group) return <div>Loading...</div>;

    const groupMembers = group.members || [];
    const meetings = group.meetings || [];

    // Filter out already added members from the select list
    const availableMembers = allMembers.filter(m => !groupMembers.find((gm: any) => gm.memberId === m.id));

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/small-groups')} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{group.name}</h2>
                    <p className="text-sm text-gray-500">{group.type.replace('_', ' ')} • {group.location || 'No Location'}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100 uppercase text-xs font-bold text-gray-500">
                    <button
                        className={`flex-1 flex items-center justify-center py-4 hover:bg-gray-50 ${activeTab === 'MEMBERS' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30' : ''}`}
                        onClick={() => setActiveTab('MEMBERS')}
                    >
                        <Users className="w-4 h-4 mr-2" /> Members ({groupMembers.length})
                    </button>
                    <button
                        className={`flex-1 flex items-center justify-center py-4 hover:bg-gray-50 ${activeTab === 'MEETINGS' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30' : ''}`}
                        onClick={() => setActiveTab('MEETINGS')}
                    >
                        <Calendar className="w-4 h-4 mr-2" /> Meetings
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'MEMBERS' && (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <Button onClick={() => setIsAddMemberOpen(true)} size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Member
                                </Button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3">Name</th>
                                            <th className="px-4 py-3">Role</th>
                                            <th className="px-4 py-3">Joined Date</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {groupMembers.map((gm: any) => (
                                            <tr key={gm.id}>
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {gm.member.firstName} {gm.member.lastName}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select 
                                                        value={gm.role} 
                                                        onChange={(e) => handleChangeRole(gm.memberId, e.target.value)}
                                                        className="text-xs border-gray-300 rounded px-2 py-1 focus:ring-primary-500 focus:border-primary-500"
                                                    >
                                                        <option value="MEMBER">Member</option>
                                                        <option value="ASSISTANT">Assistant</option>
                                                        <option value="TREASURER">Treasurer</option>
                                                        <option value="LEADER">Leader</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">
                                                    {new Date(gm.joinedAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleRemoveMember(gm.memberId)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {groupMembers.length === 0 && (
                                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">No members in this group yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'MEETINGS' && (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <Button onClick={() => setIsAddMeetingOpen(true)} size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Meeting
                                </Button>
                            </div>

                            <div className="grid gap-4">
                                {meetings.map((m: any) => (
                                    <div key={m.id} 
                                        className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                                        onClick={() => navigate(`/small-groups/${id}/meetings/${m.id}`)}
                                    >
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{m.title || 'Regular Meeting'}</h4>
                                            <p className="text-sm text-gray-500">{new Date(m.date).toLocaleString()}</p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Take Attendance
                                        </Button>
                                    </div>
                                ))}
                                {meetings.length === 0 && (
                                    <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                                        No meetings scheduled.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Member Modal */}
            {isAddMemberOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">Add Member to Group</h3>
                            <button onClick={() => setIsAddMemberOpen(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full">✕</button>
                        </div>
                        <form onSubmit={handleAddMember} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Member</label>
                                <Select 
                                    options={availableMembers.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }))}
                                    value={availableMembers.find(m => m.id === selectedMember) ? { value: selectedMember, label: `${availableMembers.find(m => m.id === selectedMember)?.firstName} ${availableMembers.find(m => m.id === selectedMember)?.lastName}` } : null}
                                    onChange={(selected: any) => setSelectedMember(selected ? selected.value : '')}
                                    isClearable
                                    placeholder="Search member by typing..."
                                    className="text-sm"
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                                    <option value="MEMBER">Member</option>
                                    <option value="ASSISTANT">Assistant</option>
                                    <option value="TREASURER">Treasurer</option>
                                    <option value="LEADER">Leader</option>
                                </select>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="submit" disabled={!selectedMember}>Add</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Meeting Modal */}
            {isAddMeetingOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">Schedule Meeting</h3>
                            <button onClick={() => setIsAddMeetingOpen(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full">✕</button>
                        </div>
                        <form onSubmit={handleCreateMeeting} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Date & Time</label>
                                <input required type="datetime-local" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                                <input type="text" value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="e.g. Regular Friday Cell" />
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="submit">Schedule</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
