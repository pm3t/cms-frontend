import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { X, UserPlus } from 'lucide-react';
import api from '../../lib/axios';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddMemberModal({ isOpen, onClose, onSuccess }: AddMemberModalProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        referenceNumber: '',
        email: '',
        phone: '',
        gender: 'M',
        status: 'ACTIVE',
        category: 'ADULT',
        birthDate: '',
        address: ''
    });
    const [ageRules, setAgeRules] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            api.get('/tenant/profile')
                .then(res => {
                    if (res.data?.ageGroupRules && Array.isArray(res.data.ageGroupRules)) {
                        setAgeRules(res.data.ageGroupRules);
                    }
                })
                .catch(err => console.error('Failed to fetch age group rules:', err));
        }
    }, [isOpen]);

    const calculateCategory = (birthDateStr: string) => {
        if (!birthDateStr) return formData.category;
        const birthDate = new Date(birthDateStr);
        if (isNaN(birthDate.getTime())) return formData.category;

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const rules = ageRules.length > 0 ? ageRules : [
            { category: 'CHILDREN', minAge: 0, maxAge: 12, label: 'Anak' },
            { category: 'YOUTH', minAge: 13, maxAge: 20, label: 'Remaja/Youth' },
            { category: 'ADULT', minAge: 21, maxAge: 59, label: 'Dewasa' },
            { category: 'ELDERLY', minAge: 60, maxAge: 150, label: 'Lansia' }
        ];

        const matched = rules.find((r: any) => age >= r.minAge && age <= r.maxAge);
        return matched ? matched.category : 'ADULT';
    };

    const handleBirthDateChange = (dateVal: string) => {
        const calculatedCat = calculateCategory(dateVal);
        setFormData(prev => ({
            ...prev,
            birthDate: dateVal,
            category: calculatedCat
        }));
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName.trim()) {
            alert('First name is required');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
                address: formData.address || null,
                referenceNumber: formData.referenceNumber || null
            };
            await api.post('/members', payload);
            alert('Member added successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || error.message;
            alert('Failed to add member: ' + JSON.stringify(errorMsg));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center">
                        <UserPlus className="w-5 h-5 mr-2 text-primary-500" />
                        Add New Member
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="add-member-form" onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                <Input
                                    placeholder="e.g. John"
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <Input
                                    placeholder="e.g. Doe"
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">No. Induk Jemaat (Referensi)</label>
                                <Input
                                    placeholder="e.g. NIK-12345"
                                    value={formData.referenceNumber}
                                    onChange={e => setFormData({ ...formData, referenceNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <Input
                                    type="email"
                                    placeholder="e.g. john@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <Input
                                    placeholder="e.g. 08123456789"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="M">Laki-Laki (M)</option>
                                    <option value="F">Perempuan (F)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="CANDIDATE">Candidate / Calon</option>
                                    <option value="GUEST">Guest / Tamu</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                                <Input
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={e => handleBirthDateChange(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none ${formData.birthDate ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                                    value={formData.category}
                                    onChange={e => !formData.birthDate && setFormData({ ...formData, category: e.target.value })}
                                    disabled={!!formData.birthDate}
                                >
                                    <option value="ADULT">Dewasa (Adult)</option>
                                    <option value="CHILDREN">Anak (Children)</option>
                                    <option value="YOUTH">Remaja (Youth)</option>
                                    <option value="ELDERLY">Lansia (Elderly)</option>
                                </select>
                                {formData.birthDate && (
                                    <span className="text-[11px] text-blue-600 mt-0.5 block">Kalkulasi otomatis dari Tgl Lahir</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <Input
                                placeholder="e.g. 123 Main St"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </form>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 mt-auto">
                    <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
                    <Button type="submit" form="add-member-form" disabled={submitting || !formData.firstName.trim()}>
                        {submitting ? 'Saving...' : 'Save Member'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
