import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Sparkles, Search, User, Award, Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { resolveFileUrl } from '../../lib/config';

export default function SkillDatabase() {
    const [skills, setSkills] = useState<any[]>([]);
    const [talents, setTalents] = useState<any[]>([]);
    const [selectedSkillId, setSelectedSkillId] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Manage Skills Modal
    const [isManageSkillsOpen, setIsManageSkillsOpen] = useState(false);
    const [skillFormName, setSkillFormName] = useState('');
    const [skillFormDescription, setSkillFormDescription] = useState('');
    const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

    const fetchSkills = async () => {
        try {
            const res = await api.get('/ministry/skills');
            setSkills(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const searchTalents = async (skillId: string) => {
        setSelectedSkillId(skillId);
        setLoading(true);
        try {
            const res = await api.get(`/ministry/talents/${skillId}`);
            setTalents(res.data);
            setCurrentPage(1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSkill = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSkillId) {
                await api.put(`/ministry/skills/${editingSkillId}`, {
                    name: skillFormName.trim(),
                    description: skillFormDescription.trim() || null
                });
            } else {
                await api.post('/ministry/skills', {
                    name: skillFormName.trim(),
                    description: skillFormDescription.trim() || null
                });
            }
            setSkillFormName('');
            setSkillFormDescription('');
            setEditingSkillId(null);
            fetchSkills();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to save skill');
        }
    };

    const handleDeleteSkill = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this custom talent? Members having this talent will lose it.')) return;
        try {
            await api.delete(`/ministry/skills/${id}`);
            if (selectedSkillId === id) {
                setSelectedSkillId('');
                setTalents([]);
            }
            fetchSkills();
        } catch (err) {
            alert('Failed to delete skill');
        }
    };

    const openEditSkill = (skill: any) => {
        setEditingSkillId(skill.id);
        setSkillFormName(skill.name);
        setSkillFormDescription(skill.description || '');
    };

    const cancelEditSkill = () => {
        setEditingSkillId(null);
        setSkillFormName('');
        setSkillFormDescription('');
    };

    const paginatedTalents = talents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Talent & Skill Database</h3>
                        <p className="text-blue-100 text-sm">Discover gifted members to serve in your ministries.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsManageSkillsOpen(true)} 
                    className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold shrink-0 shadow-sm px-4 py-2.5 rounded-lg text-sm transition-all duration-200 border-none cursor-pointer"
                >
                    Manage Talent Types
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Skills Sidebar */}
                <div className="lg:col-span-1 space-y-3">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Categories</h4>
                    <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                        {skills.map(skill => (
                            <button
                                key={skill.id}
                                onClick={() => searchTalents(skill.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    selectedSkillId === skill.id 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-100'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="truncate pr-2">{skill.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                                        selectedSkillId === skill.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        {skill._count?.members || 0}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Talent List */}
                <div className="lg:col-span-3 space-y-4">
                    {!selectedSkillId ? (
                        <div className="h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-8">
                            <Search className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">Select a skill category on the left to see talented members.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-gray-900">
                                    Showing {talents.length} members with "{skills.find(s => s.id === selectedSkillId)?.name}" skill
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {paginatedTalents.map(member => {
                                    const memberSkill = member.skills.find((s: any) => s.skillId === selectedSkillId);
                                    return (
                                        <div key={member.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                                            {member.photoUrl ? (
                                                <img 
                                                    src={resolveFileUrl(member.photoUrl)} 
                                                    className="w-16 h-16 rounded-full object-cover border border-gray-100"
                                                    alt={member.firstName}
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                                                    <User className="w-8 h-8 text-blue-300" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h5 className="font-bold text-gray-900 truncate">{member.firstName} {member.lastName}</h5>
                                                <p className="text-xs text-gray-500">{member.category} • {member.gender === 'M' ? 'Male' : 'Female'}</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <Award className="w-3 h-3 text-yellow-500" />
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <div 
                                                                key={i} 
                                                                className={`w-3 h-1 rounded-full ${
                                                                    i <= (memberSkill?.proficiency || 3) ? 'bg-yellow-400' : 'bg-gray-200'
                                                                }`} 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <Pagination 
                                currentPage={currentPage}
                                totalPages={Math.ceil(talents.length / pageSize)}
                                onPageChange={setCurrentPage}
                                totalRecords={talents.length}
                                pageSize={pageSize}
                                onPageSizeChange={setPageSize}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Manage Skills Modal */}
            {isManageSkillsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Manage Talent Types</h3>
                                <p className="text-sm text-gray-500">Configure custom talents available for your members.</p>
                            </div>
                            <Button variant="ghost" onClick={() => { setIsManageSkillsOpen(false); cancelEditSkill(); }}>Close</Button>
                        </div>

                        {/* Add / Edit Form */}
                        <form onSubmit={handleSaveSkill} className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 space-y-4">
                            <h4 className="text-sm font-bold text-gray-800">{editingSkillId ? 'Edit Talent Type' : 'Add Custom Talent Type'}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Talent Name</label>
                                    <input 
                                        required 
                                        value={skillFormName} 
                                        onChange={e => setSkillFormName(e.target.value)} 
                                        placeholder="e.g. Bass Guitarist, Graphic Designer" 
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Description (Optional)</label>
                                    <input 
                                        value={skillFormDescription} 
                                        onChange={e => setSkillFormDescription(e.target.value)} 
                                        placeholder="Brief description of the skills required" 
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                {editingSkillId && (
                                    <Button type="button" variant="outline" size="sm" onClick={cancelEditSkill}>Cancel Edit</Button>
                                )}
                                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                    {editingSkillId ? 'Save Changes' : 'Create Talent'}
                                </Button>
                            </div>
                        </form>

                        {/* List of Skills */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">All Available Talents</h4>
                            <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-150">
                                {skills.map(skill => {
                                    const isSystemDefault = skill.tenantId === null;
                                    return (
                                        <div key={skill.id} className="flex justify-between items-center p-4 bg-white hover:bg-gray-50 transition-colors">
                                            <div className="min-w-0 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900 text-sm">{skill.name}</span>
                                                    {isSystemDefault && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-widest">System Default</span>
                                                    )}
                                                </div>
                                                {skill.description && (
                                                    <p className="text-xs text-gray-500 mt-1 truncate">{skill.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {isSystemDefault ? (
                                                    <div className="text-gray-300 p-1" title="Locked System Skill">
                                                        <ShieldAlert className="w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button 
                                                            onClick={() => openEditSkill(skill)} 
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteSkill(skill.id)} 
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
