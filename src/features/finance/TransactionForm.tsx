import React, { useState } from 'react';
import axios from 'axios';
import { X, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import Select from 'react-select';
import api from '../../lib/axios';

interface TransactionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => Promise<void> | void;
}

export default function TransactionForm({ isOpen, onClose, onSuccess }: TransactionFormProps) {
    const [type, setType] = useState('OFFERING');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [memberId, setMemberId] = useState('');
    const [projectId, setProjectId] = useState('');
    const [pledgeId, setPledgeId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [members, setMembers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [pledges, setPledges] = useState<any[]>([]);

    React.useEffect(() => {
        if (isOpen) {
            api.get('/members').then(res => setMembers(res.data));
            api.get('/finance/advanced/projects').then(res => setProjects(res.data));
            api.get('/finance/advanced/pledges').then(res => setPledges(res.data));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (parseFloat(amount) <= 0) return alert('Amount must be greater than 0');

        setSubmitting(true);
        try {
            await api.post('/finance', {
                type,
                amount: parseFloat(amount),
                category,
                description,
                memberId: memberId || undefined,
                projectId: projectId || undefined,
                pledgeId: pledgeId || undefined
            });

            await onSuccess();
            onClose();
            // Reset
            setMemberId('');
            setProjectId('');
            setPledgeId('');
        } catch (error: any) {
            alert('Failed to save transaction: ' + (error.message || 'Unknown error'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Record Transaction</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="OFFERING">Offering (Income)</option>
                            <option value="DONATION">Donation (Income)</option>
                            <option value="EXPENSE">Expense (Outgoing)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rp)</label>
                        <input
                            required
                            type="number"
                            min="0"
                            step="1000"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g. 100000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <input
                            required
                            type="text"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder={type === 'EXPENSE' ? 'e.g. Utility Bills, Salary' : 'e.g. Tithe, Sunday Service'}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            rows={2}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                            placeholder="Brief description of the transaction..."
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 pt-2">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Link to Member (Optional)</label>
                            <Select 
                                options={members.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }))}
                                value={members.find(m => m.id === memberId) ? { value: memberId, label: `${members.find(m => m.id === memberId)?.firstName} ${members.find(m => m.id === memberId)?.lastName}` } : null}
                                onChange={(selected: any) => setMemberId(selected ? selected.value : '')}
                                isClearable
                                placeholder="Search member by typing..."
                                className="text-sm"
                            />
                        </div>
                        {type !== 'EXPENSE' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Donation Project</label>
                                    <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                                        <option value="">None / General</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pledge Commitment</label>
                                    <select value={pledgeId} onChange={e => setPledgeId(e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                                        <option value="">None</option>
                                        {pledges.filter(p => !memberId || p.memberId === memberId).map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.member.firstName} - Rp {p.amount.toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>
                            <Save className="w-4 h-4 mr-2" />
                            Record {type}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
