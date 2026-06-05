import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { ClipboardList, Plus, UserCheck, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';

export default function VolunteerBoard() {
    const [recruitments, setRecruitments] = useState<any[]>([]);
    const [ministries, setMinistries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isManageAppsOpen, setIsManageAppsOpen] = useState(false);
    const [selectedRecruitment, setSelectedRecruitment] = useState<any>(null);
    const [editingRecruitmentId, setEditingRecruitmentId] = useState<string | null>(null);
    const [applications, setApplications] = useState<any[]>([]);
    
    // Form state
    const [ministryId, setMinistryId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchApplications = async (recId: string) => {
        try {
            const res = await api.get(`/ministry/volunteer/${recId}/applications`);
            setApplications(res.data);
        } catch (err) {
            console.error('Failed to load apps', err);
        }
    };

    const handleManageApps = (rec: any) => {
        setSelectedRecruitment(rec);
        setIsManageAppsOpen(true);
        fetchApplications(rec.id);
    };

    const updateAppStatus = async (appId: string, status: string) => {
        try {
            await api.patch(`/ministry/volunteer/applications/${appId}`, { status });
            // refresh
            if (selectedRecruitment) {
                fetchApplications(selectedRecruitment.id);
            }
            fetchData(); // to update count or general status
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rRes, mRes] = await Promise.all([
                api.get('/ministry/volunteer'),
                api.get('/ministry')
            ]);
            setRecruitments(rRes.data);
            setMinistries(mRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveRecruitment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRecruitmentId) {
                await api.put(`/ministry/volunteer/${editingRecruitmentId}`, { ministryId, title, description, requirements });
            } else {
                await api.post('/ministry/volunteer', { ministryId, title, description, requirements });
            }
            setIsModalOpen(false);
            setEditingRecruitmentId(null);
            setMinistryId('');
            setTitle('');
            setDescription('');
            setRequirements('');
            fetchData();
        } catch (err) {
            alert('Failed to save recruitment');
        }
    };

    const handleDeleteRecruitment = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this recruitment post?')) return;
        try {
            await api.delete(`/ministry/volunteer/${id}`);
            fetchData();
        } catch (err) {
            alert('Failed to delete recruitment');
        }
    };

    const openEditModal = (rec: any) => {
        setEditingRecruitmentId(rec.id);
        setMinistryId(rec.ministryId);
        setTitle(rec.title);
        setDescription(rec.description);
        setRequirements(rec.requirements || '');
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingRecruitmentId(null);
        setMinistryId('');
        setTitle('');
        setDescription('');
        setRequirements('');
        setIsModalOpen(true);
    };

    const paginatedRecruitments = recruitments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Volunteer Recruitment Board</h3>
                <Button onClick={openCreateModal} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Post Requirement
                </Button>
            </div>

            <div className="space-y-4">
                {paginatedRecruitments.map(rec => (
                    <div key={rec.id} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-bold rounded uppercase tracking-widest">
                                    {rec.ministry.name}
                                </span>
                                <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-widest ${
                                    rec.status === 'OPEN' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
                                }`}>
                                    {rec.status}
                                </span>
                            </div>
                            <h4 className="font-bold text-gray-900 text-lg">{rec.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{rec.description}</p>
                            {rec.requirements && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <AlertCircle className="w-3 h-3" />
                                    Requirements: {rec.requirements}
                                </div>
                            )}
                            <div className="flex gap-3 mt-3">
                                <button onClick={() => openEditModal(rec)} className="text-xs font-bold text-blue-600 hover:underline">Edit</button>
                                <button onClick={() => handleDeleteRecruitment(rec.id)} className="text-xs font-bold text-red-600 hover:underline">Delete</button>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                            <div className="text-center">
                                <p className="text-xl font-black text-gray-900">{rec._count?.applications || 0}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Applicants</p>
                            </div>
                            <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={() => handleManageApps(rec)}>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Manage Apps
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Pagination 
                currentPage={currentPage}
                totalPages={Math.ceil(recruitments.length / pageSize)}
                onPageChange={setCurrentPage}
                totalRecords={recruitments.length}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
            />

            {/* Manage Apps Modal */}
            {isManageAppsOpen && selectedRecruitment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Manage Applications</h3>
                                <p className="text-sm text-gray-500">{selectedRecruitment.title} - {selectedRecruitment.ministry.name}</p>
                            </div>
                            <Button variant="ghost" onClick={() => setIsManageAppsOpen(false)}>Close</Button>
                        </div>

                        {applications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                No applications yet for this position.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {applications.map(app => (
                                    <div key={app.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-gray-900">{app.member.firstName} {app.member.lastName}</h4>
                                                <div className="text-xs text-gray-500 mt-1 space-x-3">
                                                    <span>{app.member.phone || 'No phone'}</span>
                                                    <span>{app.member.email || 'No email'}</span>
                                                </div>
                                                {app.notes && (
                                                    <p className="text-sm text-gray-600 mt-2 bg-yellow-50 p-2 rounded-lg italic">
                                                        "{app.notes}"
                                                    </p>
                                                )}
                                                <div className="mt-2">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${
                                                        app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                        app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                            </div>
                                            {app.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateAppStatus(app.id, 'REJECTED')}>
                                                        Reject
                                                    </Button>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateAppStatus(app.id, 'APPROVED')}>
                                                        Approve
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create / Edit Recruitment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">{editingRecruitmentId ? 'Edit Recruitment' : 'Post Volunteer Recruitment'}</h3>
                        <form onSubmit={handleSaveRecruitment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Target Ministry</label>
                                <select 
                                    required 
                                    value={ministryId} 
                                    onChange={e => setMinistryId(e.target.value)} 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Select Ministry Group...</option>
                                    {ministries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Position Title</label>
                                <input 
                                    required 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)} 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    placeholder="e.g. Lead Guitarist, Sunday School Teacher"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Job Description</label>
                                <textarea 
                                    rows={3} 
                                    required
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    placeholder="What will the volunteer do?"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Requirements (Optional)</label>
                                <textarea 
                                    rows={2} 
                                    value={requirements} 
                                    onChange={e => setRequirements(e.target.value)} 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    placeholder="e.g. Must have own guitar, 2 years experience"
                                />
                            </div>
                            <div className="flex gap-3 mt-8">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
                                <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">{editingRecruitmentId ? 'Save Changes' : 'Post Position'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
