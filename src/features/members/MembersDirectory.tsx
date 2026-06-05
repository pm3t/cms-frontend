import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Search, Download, UserPlus, Filter, Trash2, CheckSquare, FileSpreadsheet } from 'lucide-react';
import api from '../../lib/axios';
import * as XLSX from 'xlsx';
import { Pagination } from '../../components/ui/Pagination';
import { useAuthStore } from '../../stores/authStore';
import ImportMembersModal from './ImportMembersModal';
import AddMemberModal from './AddMemberModal';
import { resolveFileUrl } from '../../lib/config';

export default function MembersDirectory() {
    const [members, setMembers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [deleting, setDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchMembers = () => {
        setLoading(true);
        api.get('/members')
            .then(res => { setMembers(res.data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    };

    useEffect(() => { fetchMembers(); }, []);

    const filteredMembers = members.filter(m =>
        m.firstName.toLowerCase().includes(search.toLowerCase()) ||
        m.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination logic
    const getTenantId = () => {
        const token = useAuthStore.getState().token;
        if (!token) return 'global';
        try { return JSON.parse(atob(token.split('.')[1])).tenantId; } catch { return 'global'; }
    };
    const pageSizeStr = localStorage.getItem(`pageSize_${getTenantId()}`) || '10';
    const parsedSize = parseInt(pageSizeStr);
    const pageSize = pageSizeStr === 'All' ? Math.max(filteredMembers.length, 1) : (isNaN(parsedSize) ? 10 : parsedSize);
    const totalPages = pageSizeStr === 'All' ? 1 : Math.max(Math.ceil(filteredMembers.length / pageSize), 1);

    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }
    const paginatedMembers = pageSizeStr === 'All' ? filteredMembers : filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // --- Selection helpers ---
    const allSelected = paginatedMembers.length > 0 && paginatedMembers.every(m => selectedIds.has(m.id));
    const someSelected = selectedIds.size > 0;

    const toggleOne = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (allSelected) {
            // Deselect the current page
            setSelectedIds(prev => {
                const next = new Set(prev);
                paginatedMembers.forEach(m => next.delete(m.id));
                return next;
            });
        } else {
            // Select the current page
            setSelectedIds(prev => {
                const next = new Set(prev);
                paginatedMembers.forEach(m => next.add(m.id));
                return next;
            });
        }
    };

    // --- Delete single ---
    const handleDeleteOne = async (id: string, name: string) => {
        if (!confirm(`Hapus anggota "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        setDeleting(true);
        try {
            await api.delete(`/members/${id}`);
            setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
            fetchMembers();
        } catch (err: any) {
            alert('Gagal menghapus: ' + (err.message));
        } finally {
            setDeleting(false);
        }
    };

    // --- Bulk delete ---
    const handleBulkDelete = async () => {
        if (!confirm(`Hapus ${selectedIds.size} anggota yang dipilih? Tindakan ini tidak dapat dibatalkan.`)) return;
        setDeleting(true);
        try {
            await api.delete('/members/bulk', {
                data: { ids: Array.from(selectedIds) }
            });
            setSelectedIds(new Set());
            fetchMembers();
        } catch (err: any) {
            alert('Gagal bulk delete: ' + (err.message));
        } finally {
            setDeleting(false);
        }
    };

    // --- Export ---
    const handleExportToExcel = () => {
        if (filteredMembers.length === 0) {
            alert('Tidak ada data anggota untuk diekspor.');
            return;
        }

        const dataToExport = filteredMembers.map(m => ({
            firstName: m.firstName,
            lastName: m.lastName || '',
            gender: m.gender || '',
            birthDate: m.birthDate ? new Date(m.birthDate).toISOString().split('T')[0] : '',
            email: m.email || '',
            phone: m.phone || '',
            address: m.address || '',
            status: m.status,
            category: m.category,
            isPrivate: m.isPrivate ? 'TRUE' : 'FALSE',
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        worksheet['!cols'] = [
            { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 },
            { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 12 },
            { wch: 12 }, { wch: 10 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `Members_Directory_${timestamp}.xlsx`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Members Directory</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage congregations, families, and membership statuses.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={handleExportToExcel}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                        <Download className="w-4 h-4 mr-2" />
                        Import
                    </Button>
                    <Button onClick={() => setIsAddOpen(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Member
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center bg-gray-50/50">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search members by name or email..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                        <Filter className="w-4 h-4 mr-2" /> Filters
                    </Button>

                    {/* Bulk delete bar — appears when items are selected */}
                    {someSelected && (
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="text-sm text-gray-600 font-medium">
                                <CheckSquare className="w-4 h-4 inline mr-1 text-primary-500" />
                                {selectedIds.size} dipilih
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBulkDelete}
                                disabled={deleting}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Hapus {selectedIds.size} anggota
                            </Button>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        disabled={filteredMembers.length === 0}
                                        className="w-4 h-4 rounded accent-primary-600 cursor-pointer"
                                        title="Pilih semua"
                                    />
                                </th>
                                <th className="px-4 py-4">Name</th>
                                <th className="px-4 py-4">Status</th>
                                <th className="px-4 py-4">Category</th>
                                <th className="px-4 py-4">Contact</th>
                                <th className="px-4 py-4">Privacy</th>
                                <th className="px-4 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">Loading directory...</td>
                                </tr>
                            ) : paginatedMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No members found matching the current filters.</td>
                                </tr>
                            ) : (
                                paginatedMembers.map(m => {
                                    const isSelected = selectedIds.has(m.id);
                                    return (
                                        <tr
                                            key={m.id}
                                            className={`transition-colors ${isSelected ? 'bg-primary-50/60' : 'hover:bg-gray-50/50'}`}
                                        >
                                            <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleOne(m.id)}
                                                    className="w-4 h-4 rounded accent-primary-600 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-4 py-4 font-medium text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    {m.photoUrl ? (
                                                        <img
                                                            src={resolveFileUrl(m.photoUrl)}
                                                            alt={m.firstName}
                                                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                            {m.firstName.charAt(0)}{m.lastName?.charAt(0) || ''}
                                                        </div>
                                                    )}
                                                    {m.firstName} {m.lastName}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${m.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {m.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-gray-500">{m.category}</td>
                                            <td className="px-4 py-4 text-gray-500">
                                                <div>{m.email || 'No email'}</div>
                                                <div className="text-xs">{m.phone || 'No phone'}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-0.5 rounded text-xs ${m.isPrivate ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {m.isPrivate ? 'Private' : 'Public'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link to={`/members/${m.id}`}>
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteOne(m.id, `${m.firstName} ${m.lastName || ''}`)}
                                                        disabled={deleting}
                                                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalRecords={filteredMembers.length}
                    pageSize={pageSize}
                    onPageSizeChange={(size) => {
                        localStorage.setItem(`pageSize_${getTenantId()}`, size.toString());
                        setCurrentPage(1);
                    }}
                />
            </div>

            <ImportMembersModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onSuccess={fetchMembers}
            />

            <AddMemberModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSuccess={fetchMembers}
            />
        </div>
    );
}
