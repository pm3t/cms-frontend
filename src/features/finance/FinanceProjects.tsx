import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Target, Calendar, CheckCircle, Plus, Edit2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';

export default function FinanceProjects() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<any>(null);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [targetAmount, setTargetAmount] = useState('');

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await api.get('/finance/advanced/projects');
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { 
                name, 
                description, 
                targetAmount: parseFloat(targetAmount) || undefined 
            };
            if (editingProject) {
                await api.put(`/finance/advanced/projects/${editingProject.id}`, payload);
            } else {
                await api.post('/finance/advanced/projects', payload);
            }
            setIsModalOpen(false);
            fetchProjects();
        } catch (err) {
            alert('Failed to save project');
        }
    };

    const handleOpenNew = () => {
        setEditingProject(null);
        setName('');
        setDescription('');
        setTargetAmount('');
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Donation Projects</h3>
                <Button onClick={handleOpenNew} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(p => {
                    const progress = p.targetAmount ? (p.totalCollected / p.targetAmount) * 100 : 0;
                    return (
                        <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <Target className="w-5 h-5 text-green-600" />
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>
                            <h4 className="font-bold text-gray-900">{p.name}</h4>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description || 'No description provided.'}</p>
                            
                            {p.targetAmount && (
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-gray-500">Progress</span>
                                        <span className="text-gray-900">{progress.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div 
                                            className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs mt-1">
                                        <span className="text-green-600 font-bold">Rp {p.totalCollected?.toLocaleString('id-ID')}</span>
                                        <span className="text-gray-400">Target: Rp {p.targetAmount.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400">
                                <div className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Started: {new Date(p.startDate).toLocaleDateString()}
                                </div>
                                <button onClick={() => {
                                    setEditingProject(p);
                                    setName(p.name);
                                    setDescription(p.description || '');
                                    setTargetAmount(p.targetAmount?.toString() || '');
                                    setIsModalOpen(true);
                                }} className="text-blue-600 hover:underline">Edit</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Pagination 
                currentPage={currentPage}
                totalPages={Math.ceil(projects.length / pageSize)}
                onPageChange={setCurrentPage}
                totalRecords={projects.length}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
            />

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Name</label>
                                <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Amount (Optional)</label>
                                <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500" />
                            </div>
                            <div className="flex gap-3 mt-8">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
                                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">Save Project</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
