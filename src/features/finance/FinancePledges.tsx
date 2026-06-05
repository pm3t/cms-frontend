import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Bookmark, User, Plus, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';

export default function FinancePledges() {
    const [pledges, setPledges] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [memberId, setMemberId] = useState('');
    const [projectId, setProjectId] = useState('');
    const [amount, setAmount] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pRes, prRes, mRes] = await Promise.all([
                api.get('/finance/advanced/pledges'),
                api.get('/finance/advanced/projects'),
                api.get('/members')
            ]);
            setPledges(pRes.data);
            setProjects(prRes.data);
            setMembers(mRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/finance/advanced/pledges', {
                memberId,
                projectId: projectId || undefined,
                amount: parseFloat(amount)
            });
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            alert('Failed to save pledge');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Member Pledges</h3>
                <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Record Pledge
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                        <tr>
                            <th className="px-5 py-4">Donor Name</th>
                            <th className="px-5 py-4">Project</th>
                            <th className="px-5 py-4 text-right">Pledged Amount</th>
                            <th className="px-5 py-4 text-center">Status</th>
                            <th className="px-5 py-4">Commitment Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pledges.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(p => (
                            <tr key={p.id} className="hover:bg-gray-50/50">
                                <td className="px-5 py-4">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                                            <User className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">{p.member.firstName} {p.member.lastName}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-gray-600">{p.project?.name || 'General Fund'}</td>
                                <td className="px-5 py-4 text-right font-bold text-gray-900">Rp {p.amount.toLocaleString('id-ID')}</td>
                                <td className="px-5 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                        p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination 
                    currentPage={currentPage}
                    totalPages={Math.ceil(pledges.length / pageSize)}
                    onPageChange={setCurrentPage}
                    totalRecords={pledges.length}
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                />
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">New Donation Commitment</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Donor (Member)</label>
                                <select required value={memberId} onChange={e => setMemberId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                                    <option value="">Select Member</option>
                                    {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Project (Optional)</label>
                                <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                                    <option value="">General Fund / No Project</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Commitment Amount</label>
                                <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                            </div>
                            <div className="flex gap-3 mt-8">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
                                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">Save Pledge</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
