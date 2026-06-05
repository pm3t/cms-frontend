import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, MapPin } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../lib/config';

export default function BranchManager() {
    const [branches, setBranches] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newBranch, setNewBranch] = useState({ name: '', address: '', phone: '' });

    const fetchProfile = () => {
        axios.get(`${API_BASE_URL}/tenant/profile`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => {
            if (res.data.branches) setBranches(res.data.branches);
        });
    }

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/tenant/branch`, newBranch, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setShowForm(false);
            setNewBranch({ name: '', address: '', phone: '' });
            fetchProfile();
        } catch (err) {
            alert('Gagal menambahkan cabang');
        }
    };

    return (
        <div className="space-y-6 max-w-4xl bg-white/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-100 shadow-sm relative">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-800">Branch & Campus Management</h3>
                <Button size="sm" onClick={() => setShowForm(!showForm)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Branch
                </Button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="bg-primary-50/50 p-6 rounded-xl border border-primary-100 space-y-4 animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Branch Name" placeholder="South Campus" value={newBranch.name} onChange={e => setNewBranch({ ...newBranch, name: e.target.value })} required />
                        <Input label="Phone Number" placeholder="+62 ..." value={newBranch.phone} onChange={e => setNewBranch({ ...newBranch, phone: e.target.value })} />
                    </div>
                    <Input label="Address" placeholder="Full address" value={newBranch.address} onChange={e => setNewBranch({ ...newBranch, address: e.target.value })} />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button type="submit">Create Branch</Button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {branches.length === 0 && !showForm && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        No branches mapped. Add your primary sub-campus to activate multi-branch operations.
                    </div>
                )}
                {branches.map(b => (
                    <div key={b.id} className="p-5 border border-gray-100 rounded-xl bg-white hover:border-primary-300 transition-colors shadow-sm">
                        <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                            <MapPin className="text-primary-500 w-5 h-5 shrink-0" />
                            {b.name}
                        </h4>
                        <p className="text-sm text-gray-500 mt-2">{b.address || 'No address specified'}</p>
                        <p className="text-sm text-gray-500 mt-1">{b.phone}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
