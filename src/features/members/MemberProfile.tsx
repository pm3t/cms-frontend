import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, Camera, Users, BookOpen, Save, Trash2, Plus, ShieldCheck } from 'lucide-react';
import api from '../../lib/axios';
import { resolveFileUrl } from '../../lib/config';

export default function MemberProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [member, setMember] = useState<any>(null);
    const [families, setFamilies] = useState<any[]>([]);
    const [availableSkills, setAvailableSkills] = useState<any[]>([]);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    // Tab State
    const [activeTab, setActiveTab] = useState<'profile' | 'family' | 'sacraments' | 'skills'>('profile');
    const [loading, setLoading] = useState(true);
    const [loadingSkills, setLoadingSkills] = useState(false);

    // Feature availability (detected from API responses)
    const [hasMinistryFeature, setHasMinistryFeature] = useState<boolean | null>(null);

    const [sacramentForm, setSacramentForm] = useState({ type: 'BAPTISM', date: '', location: '', pastorName: '' });
    const [newFamilyName, setNewFamilyName] = useState('');
    const [selectedSkillId, setSelectedSkillId] = useState('');
    const [proficiency, setProficiency] = useState<number>(3);
    const [newMobilePassword, setNewMobilePassword] = useState('');

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({
        firstName: '',
        lastName: '',
        referenceNumber: '',
        gender: 'M',
        birthDate: '',
        address: '',
        email: '',
        phone: '',
        status: 'ACTIVE',
        category: 'ADULT',
        isPrivate: false,
    });
    const [ageRules, setAgeRules] = useState<any[]>([]);

    useEffect(() => {
        api.get('/tenant/profile')
            .then(res => {
                if (res.data?.ageGroupRules && Array.isArray(res.data.ageGroupRules)) {
                    setAgeRules(res.data.ageGroupRules);
                }
            })
            .catch(err => console.error('Failed to fetch age group rules:', err));
    }, []);

    const calculateCategory = (birthDateStr: string) => {
        if (!birthDateStr) return editForm.category;
        const birthDate = new Date(birthDateStr);
        if (isNaN(birthDate.getTime())) return editForm.category;

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
        setEditForm((prev: any) => ({
            ...prev,
            birthDate: dateVal,
            category: calculatedCat
        }));
    };

    const fetchData = async () => {
        if (!id) return;
        try {
            const [memRes, famRes] = await Promise.allSettled([
                api.get(`/members/${id}`),
                api.get('/members/families/all'),
            ]);

            // Member data is critical — fail if it can't be loaded
            if (memRes.status === 'rejected') throw memRes.reason;
            setMember(memRes.value.data);
            setEditForm({
                firstName: memRes.value.data.firstName || '',
                lastName: memRes.value.data.lastName || '',
                referenceNumber: memRes.value.data.referenceNumber || '',
                gender: memRes.value.data.gender || 'M',
                birthDate: memRes.value.data.birthDate ? new Date(memRes.value.data.birthDate).toISOString().split('T')[0] : '',
                address: memRes.value.data.address || '',
                email: memRes.value.data.email || '',
                phone: memRes.value.data.phone || '',
                status: memRes.value.data.status || 'ACTIVE',
                category: memRes.value.data.category || 'ADULT',
                isPrivate: memRes.value.data.isPrivate || false,
            });

            // Families — non-critical, default to empty list
            if (famRes.status === 'fulfilled') setFamilies(famRes.value.data);

            setLoading(false);
        } catch (err) {
            console.error(err);
            alert("Failed to load member profile.");
            navigate('/members');
        }
    };

    // Lazy-load skills only when the Skills tab is opened
    const fetchSkills = async () => {
        if (availableSkills.length > 0 || hasMinistryFeature === false) return;
        setLoadingSkills(true);
        try {
            const res = await api.get('/ministry/skills');
            setAvailableSkills(res.data);
            setHasMinistryFeature(true);
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 403) {
                // Plan doesn't include ministry_management — hide the tab
                setHasMinistryFeature(false);
            } else {
                console.error('[MemberProfile] Failed to load skills:', err.message);
            }
        } finally {
            setLoadingSkills(false);
        }
    };

    const handleTabChange = (tab: 'profile' | 'family' | 'sacraments' | 'skills') => {
        setActiveTab(tab);
        if (tab === 'skills') fetchSkills();
    };

    const handleSaveProfile = async () => {
        if (!editForm.firstName.trim()) {
            alert('First name is required');
            return;
        }
        try {
            const payload = {
                ...editForm,
                birthDate: editForm.birthDate ? new Date(editForm.birthDate).toISOString() : null,
                referenceNumber: editForm.referenceNumber || null
            };
            await api.patch(`/members/${id}`, payload);
            alert('Profile updated successfully!');
            setIsEditing(false);
            fetchData();
        } catch (err: any) {
            alert('Failed to save profile: ' + (err.response?.data?.error || err.message));
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, navigate]);

    const handleUpdatePicture = () => {
        photoInputRef.current?.click();
    };

    const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingPhoto(true);
        try {
            const form = new FormData();
            form.append('photo', file);
            const res = await api.post(
                `/members/${id}/photo`,
                form,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setMember((prev: any) => ({ ...prev, photoUrl: res.data.photoUrl }));
        } catch (err: any) {
            alert('Gagal upload foto: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploadingPhoto(false);
            if (photoInputRef.current) photoInputRef.current.value = '';
        }
    };

    const handleAssignFamily = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        try {
            const famId = e.target.value || null;
            await api.patch(`/members/${id}`, { familyId: famId });
            alert('Family updated');
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSetAsHead = async () => {
        if (!member.familyId) return;
        try {
            await api.patch(`/members/families/${member.familyId}`, { headOfFamilyId: member.id, name: member.family.name });
            alert('Set as Family Head successfully!');
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddSacrament = async () => {
        try {
            await api.post(`/members/${id}/sacraments`, sacramentForm);
            alert('Sacrament record added!');
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddSkill = async () => {
        if (!selectedSkillId) return;
        try {
            await api.post(`/ministry/skills/members/${id}`, { skillId: selectedSkillId, proficiency });
            setSelectedSkillId(''); // Reset selection
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to add skill');
        }
    };

    const handleRemoveSkill = async (skillId: string) => {
        if (!window.confirm('Remove this skill?')) return;
        try {
            await api.delete(`/ministry/skills/members/${id}/${skillId}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to remove skill');
        }
    };

    const handleCreateFamily = async () => {
        if (!newFamilyName.trim()) return;
        try {
            const res = await api.post(`/members/families/create`, { name: newFamilyName });
            alert(`Family "${res.data.name}" created! Now you can assign members to it.`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Errors creating family.");
        }
    };

    const handleResetMobilePassword = async () => {
        if (!newMobilePassword || newMobilePassword.length < 6) {
            alert('Password minimal 6 karakter');
            return;
        }
        try {
            await api.post(`/members/${id}/reset-password`, { password: newMobilePassword });
            alert('Password mobile berhasil diupdate/reset!');
            setNewMobilePassword('');
            fetchData();
        } catch (err: any) {
            alert('Gagal mereset password: ' + (err.response?.data?.error || err.message));
        }
    };


    if (loading || !member) return <div className="p-8 text-center text-gray-500">Loading Member Profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={() => navigate('/members')} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Directory
            </button>

            {/* Header / Meta Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700"></div>
                <div className="px-8 pb-8 flex flex-col sm:flex-row gap-6 items-start -mt-12">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl bg-white p-1 border border-gray-200 shadow-sm relative">
                            {member.photoUrl ? (
                                <img
                                    src={resolveFileUrl(member.photoUrl)}
                                    alt="Avatar"
                                    className="w-full h-full rounded-xl object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-2xl">
                                    {member.firstName.charAt(0)}
                                </div>
                            )}
                            <button
                                onClick={handleUpdatePicture}
                                disabled={uploadingPhoto}
                                className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-xl text-white transition-all cursor-pointer disabled:opacity-60"
                            >
                                {uploadingPhoto ? (
                                    <span className="text-xs font-semibold">Uploading...</span>
                                ) : (
                                    <Camera className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                        {/* Hidden file input */}
                        <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={handlePhotoFileChange}
                        />
                    </div>
                    <div className="flex-1 mt-14 sm:mt-0 pt-2">
                        <h1 className="text-2xl font-bold text-gray-900">{member.firstName} {member.lastName}</h1>
                        <p className="text-gray-500 font-medium">{member.email || 'No email registered'} • {member.phone || 'No phone'}</p>

                        <div className="flex gap-2 mt-3">
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">{member.status}</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{member.category}</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-t border-gray-100 px-4">
                    <button onClick={() => handleTabChange('profile')} className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'profile' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                        Profile Details
                    </button>
                    <button onClick={() => handleTabChange('family')} className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'family' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                        <Users className="w-4 h-4" /> Family
                    </button>
                    <button onClick={() => handleTabChange('sacraments')} className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'sacraments' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                        <BookOpen className="w-4 h-4" /> Sacraments
                    </button>
                    {/* Only show Skills tab if ministry_management is available (not false = unknown or true) */}
                    {hasMinistryFeature !== false && (
                        <button onClick={() => handleTabChange('skills')} className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'skills' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                            <ShieldCheck className="w-4 h-4" /> Skills & Talents
                        </button>
                    )}
                </div>
            </div>

            {/* Tab Body */}
            {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in fade-in space-y-6">
                    <div className="flex justify-between items-center border-b pb-3">
                        <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => {
                                    setIsEditing(false);
                                    setEditForm({
                                        firstName: member.firstName || '',
                                        lastName: member.lastName || '',
                                        referenceNumber: member.referenceNumber || '',
                                        gender: member.gender || 'M',
                                        birthDate: member.birthDate ? new Date(member.birthDate).toISOString().split('T')[0] : '',
                                        address: member.address || '',
                                        email: member.email || '',
                                        phone: member.phone || '',
                                        status: member.status || 'ACTIVE',
                                        category: member.category || 'ADULT',
                                        isPrivate: member.isPrivate || false,
                                    });
                                }}>Cancel</Button>
                                <Button onClick={handleSaveProfile} className="flex items-center gap-1">
                                    <Save className="w-4 h-4" /> Save
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                            <Input 
                                value={isEditing ? editForm.firstName : member.firstName} 
                                onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
                                readOnly={!isEditing} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <Input 
                                value={isEditing ? editForm.lastName : (member.lastName || '')} 
                                onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
                                readOnly={!isEditing} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">No. Induk Jemaat (Referensi)</label>
                            <Input 
                                value={isEditing ? editForm.referenceNumber : (member.referenceNumber || '')} 
                                onChange={e => setEditForm({ ...editForm, referenceNumber: e.target.value })}
                                readOnly={!isEditing} 
                                placeholder="e.g. NIK-12345"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            {isEditing ? (
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    value={editForm.gender}
                                    onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                                >
                                    <option value="M">Laki-Laki (M)</option>
                                    <option value="F">Perempuan (F)</option>
                                </select>
                            ) : (
                                <Input value={member.gender === 'M' ? 'Laki-Laki (M)' : 'Perempuan (F)'} readOnly />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                            {isEditing ? (
                                <Input 
                                    type="date"
                                    value={editForm.birthDate} 
                                    onChange={e => handleBirthDateChange(e.target.value)}
                                />
                            ) : (
                                <Input value={member.birthDate ? new Date(member.birthDate).toLocaleDateString('id-ID') : 'Not specified'} readOnly />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            {isEditing ? (
                                <div>
                                    <select
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none ${editForm.birthDate ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                                        value={editForm.category}
                                        onChange={e => !editForm.birthDate && setEditForm({ ...editForm, category: e.target.value })}
                                        disabled={!!editForm.birthDate}
                                    >
                                        <option value="ADULT">Dewasa (Adult)</option>
                                        <option value="CHILDREN">Anak (Children)</option>
                                        <option value="YOUTH">Remaja (Youth)</option>
                                        <option value="ELDERLY">Lansia (Elderly)</option>
                                    </select>
                                    {editForm.birthDate && (
                                        <span className="text-[11px] text-blue-600 mt-0.5 block">Kalkulasi otomatis dari Tgl Lahir</span>
                                    )}
                                </div>
                            ) : (
                                <Input value={member.category} readOnly />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <Input 
                                value={isEditing ? editForm.email : (member.email || '')} 
                                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                readOnly={!isEditing} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <Input 
                                value={isEditing ? editForm.phone : (member.phone || '')} 
                                onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                readOnly={!isEditing} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            {isEditing ? (
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    value={editForm.status}
                                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="CANDIDATE">Candidate / Calon</option>
                                    <option value="GUEST">Guest / Tamu</option>
                                </select>
                            ) : (
                                <Input value={member.status} readOnly />
                            )}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <Input 
                                value={isEditing ? editForm.address : (member.address || '')} 
                                onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                                readOnly={!isEditing} 
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                <input 
                                    type="checkbox" 
                                    disabled={!isEditing}
                                    checked={isEditing ? editForm.isPrivate : member.isPrivate}
                                    onChange={e => setEditForm({ ...editForm, isPrivate: e.target.checked })}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                Private Profile (Hidden from public directory)
                            </label>
                        </div>
                    </div>

                    {/* Reset Mobile Password Section */}
                    <div className="pt-6 border-t border-gray-100">
                        <h4 className="text-md font-bold text-gray-900 mb-1">Mobile Account Security</h4>
                        <p className="text-sm text-gray-500 mb-4">
                            {member.passwordHash 
                                ? 'Anggota ini memiliki akun mobile aktif. Anda dapat mereset password mereka di sini.' 
                                : 'Anggota ini belum memiliki password akun mobile. Anda dapat mengatur password baru di sini.'
                            }
                        </p>
                        <div className="flex items-center gap-3 max-w-md">
                            <Input 
                                type="password" 
                                placeholder="Masukkan password baru (min 6 karakter)..." 
                                value={newMobilePassword} 
                                onChange={e => setNewMobilePassword(e.target.value)}
                            />
                            <Button 
                                onClick={handleResetMobilePassword} 
                                disabled={!newMobilePassword || newMobilePassword.length < 6}
                                variant="outline"
                                className="shrink-0"
                            >
                                Reset Password
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'family' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 animate-in fade-in">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-3">Family & Household Ties</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 border border-gray-200 rounded-xl bg-gray-50">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Assign to Family Group</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                    value={member.familyId || ''}
                                    onChange={handleAssignFamily}
                                >
                                    <option value="">-- No Family (Individual) --</option>
                                    {families.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-2">Connecting to a family group synchronizes billing and records.</p>
                            </div>

                            <div className="pt-4 mt-4 border-t border-gray-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Or Create a New Family</label>
                                <div className="flex gap-2">
                                    <Input placeholder="e.g. Keluarga Panjaitan" value={newFamilyName} onChange={e => setNewFamilyName(e.target.value)} />
                                    <Button onClick={handleCreateFamily} disabled={!newFamilyName.trim()}>Create</Button>
                                </div>
                            </div>
                        </div>

                        {member.familyId && member.family && (
                            <div className="p-5 border border-blue-200 rounded-xl bg-blue-50 relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-24 h-24 bg-blue-100 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <h4 className="font-bold text-blue-900">Current Family: {member.family.name}</h4>
                                <p className="text-sm border-blue-200 mt-1">
                                    {member.family.headOfFamilyId === member.id ? (
                                        <span className="text-blue-700 font-bold items-center flex mt-2"><ShieldCheck className="w-4 h-4 mr-1" /> You are the Head of this Family</span>
                                    ) : (
                                        <Button variant="outline" size="sm" className="mt-3 bg-white border-blue-300 text-blue-700" onClick={handleSetAsHead}>
                                            Set as Head of Family
                                        </Button>
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'sacraments' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Ministry & Sacraments Timeline</h3>
                        <p className="text-sm text-gray-500 mt-1">Maintain an official record of Baptism, Confirmation (Sidi), and more.</p>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            {member.sacraments.length === 0 ? (
                                <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl text-gray-500">
                                    No records found.
                                </div>
                            ) : (
                                <div className="pl-4 border-l-2 border-gray-200 space-y-6">
                                    {member.sacraments.map((s: any) => (
                                        <div key={s.id} className="relative">
                                            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-primary-500 rounded-full ring-4 ring-white"></div>
                                            <h4 className="font-bold text-gray-900">{s.type}</h4>
                                            <p className="text-sm font-medium text-gray-600">{new Date(s.date).toLocaleDateString()}</p>
                                            {s.church && <p className="text-sm text-gray-500">{s.church}</p>}
                                            <div className="mt-2 text-xs text-red-500 cursor-pointer font-medium hover:underline flex items-center">
                                                <Trash2 className="w-3 h-3 mr-1" /> Remove Record
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 p-5 border border-gray-100 rounded-xl">
                            <h4 className="font-semibold text-sm mb-4">Add New Sacrament</h4>
                            <div className="space-y-3">
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                    value={sacramentForm.type}
                                    onChange={e => setSacramentForm({ ...sacramentForm, type: e.target.value })}
                                >
                                    <option value="BAPTISM">Baptism / Baptis</option>
                                    <option value="CONFIRMATION">Confirmation / Sidi</option>
                                </select>
                                <Input type="date" value={sacramentForm.date} onChange={e => setSacramentForm({ ...sacramentForm, date: e.target.value })} />
                                <Input placeholder="Location / Church Name" value={sacramentForm.location} onChange={e => setSacramentForm({ ...sacramentForm, location: e.target.value })} />
                                <Input placeholder="Officiating Pastor" value={sacramentForm.pastorName} onChange={e => setSacramentForm({ ...sacramentForm, pastorName: e.target.value })} />
                                <Button className="w-full" onClick={handleAddSacrament} disabled={!sacramentForm.date}>
                                    <Plus className="w-4 h-4 mr-2" /> Save Record
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'skills' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Skills & Talents</h3>
                            <p className="text-sm text-gray-500 mt-1">Manage the member's capabilities for ministry recruitment.</p>
                        </div>
                    </div>

                    {loadingSkills ? (
                        <div className="p-10 text-center text-gray-400">Loading skills...</div>
                    ) : (
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                {!member.skills || member.skills.length === 0 ? (
                                    <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl text-gray-500">
                                        No skills recorded yet.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {member.skills.map((ms: any) => (
                                            <div key={ms.skill.id} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{ms.skill.name}</h4>
                                                    <p className="text-xs text-gray-500">Proficiency: {ms.proficiency} / 5</p>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => handleRemoveSkill(ms.skill.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 p-5 border border-gray-100 rounded-xl h-fit">
                                <h4 className="font-semibold text-sm mb-4">Add Skill</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Skill</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                            value={selectedSkillId}
                                            onChange={e => setSelectedSkillId(e.target.value)}
                                        >
                                            <option value="">-- Choose --</option>
                                            {availableSkills.map(sk => (
                                                <option key={sk.id} value={sk.id}>{sk.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Proficiency Level (1-5)</label>
                                        <input
                                            type="range"
                                            min="1" max="5"
                                            className="w-full"
                                            value={proficiency}
                                            onChange={e => setProficiency(Number(e.target.value))}
                                        />
                                        <div className="text-center font-bold text-primary-600 mt-1">{proficiency}</div>
                                    </div>
                                    <Button className="w-full mt-4" onClick={handleAddSkill} disabled={!selectedSkillId}>
                                        <Plus className="w-4 h-4 mr-2" /> Add Skill
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
