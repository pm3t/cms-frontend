import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { DollarSign, ArrowUpRight, ArrowDownRight, Plus, Trash2, FileText, Download, Filter, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import TransactionForm from './TransactionForm';
import ReceiptViewer from './ReceiptViewer';
import { Pagination } from '../../components/ui/Pagination';

import api from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';
import FinanceProjects from './FinanceProjects';
import FinancePledges from './FinancePledges';
import FinanceBudget from './FinanceBudget';
import DonorStatements from './DonorStatements';

type Tab = 'TRANSACTIONS' | 'PROJECTS' | 'PLEDGES' | 'BUDGET' | 'DONORS';

export default function FinanceDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('TRANSACTIONS');
    const [summary, setSummary] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Filter State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [isFormOpen, setIsFormOpen] = useState(false);

    // Receipt Modal State
    const [receiptData, setReceiptData] = useState<any>(null);

    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const [sumRes, trxRes] = await Promise.all([
                api.get('/finance/summary', { params }),
                api.get('/finance', { params })
            ]);
            setSummary(sumRes.data);
            setTransactions(trxRes.data);
            setError(null);
        } catch (error: any) {
            console.error('Failed to load finance data', error);
            setError(error.message || 'Failed to load transaction data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'TRANSACTIONS') {
            fetchData();
        }
        setCurrentPage(1); 
    }, [startDate, endDate, activeTab]);

    const handleExportExcel = () => {
        const rows = transactions.map(t => ({
            'Receipt No': t.receiptCode,
            'Date': new Date(t.date).toLocaleString('id-ID'),
            'Type': t.type,
            'Category': t.category,
            'Amount (Rp)': t.amount,
            'Description': t.description,
            'Member Name': t.member ? `${t.member.firstName} ${t.member.lastName}` : 'N/A'
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
        XLSX.writeFile(workbook, `Finance_Report_${startDate || 'All'}_to_${endDate || 'All'}.xlsx`);
    };

    const handleDelete = async (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Hapus Transaksi',
            message: 'Hapus transaksi ini? Aksi ini akan mempengaruhi laporan saldo dan tidak dapat dibatalkan.',
            onConfirm: async () => {
                try {
                    await api.delete(`/finance/${id}`);
                    fetchData();
                } catch (err) {
                    alert('Gagal menghapus transaksi: ' + (err instanceof Error ? err.message : 'Unknown error'));
                }
            }
        });
    };

    const handleApprove = async (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Selesaikan Transaksi',
            message: 'Selesaikan transaksi ini? Status akan diubah menjadi COMPLETED.',
            onConfirm: async () => {
                try {
                    await api.patch(`/finance/${id}/status`, { status: 'COMPLETED' });
                    fetchData();
                } catch (err) {
                    alert('Gagal menyetujui transaksi: ' + (err instanceof Error ? err.message : 'Unknown error'));
                }
            }
        });
    };

    const handleViewReceipt = (trx: any) => {
        setReceiptData(trx);
    };

    // Pagination logic
    const getTenantId = () => {
        const token = useAuthStore.getState().token;
        if (!token) return 'global';
        try { return JSON.parse(atob(token.split('.')[1])).tenantId; } catch { return 'global'; }
    };
    const pageSizeStr = localStorage.getItem(`pageSize_${getTenantId()}`) || '10';
    const parsedSize = parseInt(pageSizeStr);
    const pageSize = pageSizeStr === 'All' ? Math.max(transactions.length, 1) : (isNaN(parsedSize) ? 10 : parsedSize);
    const totalPages = pageSizeStr === 'All' ? 1 : Math.max(Math.ceil(transactions.length / pageSize), 1);

    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }
    const paginatedTransactions = pageSizeStr === 'All' ? transactions : transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-green-500 pb-1 inline-block">
                        Financial Management
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">Manage church funds, budgets, and member donations.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsFormOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Record Transaction
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 no-print">
                {(['TRANSACTIONS', 'PROJECTS', 'PLEDGES', 'BUDGET', 'DONORS'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
                            activeTab === tab 
                            ? 'border-green-600 text-green-600' 
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {tab.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex justify-between items-center no-print">
                    <span className="text-sm font-medium">{error}</span>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">&times;</button>
                </div>
            )}

            {activeTab === 'TRANSACTIONS' && (
                <>
                    {/* Date Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-4 items-end no-print">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Dari Tanggal</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">S/d Tanggal</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
                            />
                        </div>
                        <div className="flex-1"></div>
                        <Button onClick={handleExportExcel} variant="outline" size="sm" className="text-green-700 border-green-200 bg-green-50 hover:bg-green-100">
                            <Download className="w-4 h-4 mr-2" />
                            Export Excel
                        </Button>
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="text-xs text-red-500 hover:underline px-2 py-2"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Gross Income</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">Rp {summary.totalIncome.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <ArrowUpRight className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">Rp {summary.totalExpense.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg">
                                <ArrowDownRight className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Net Balance</p>
                                <p className={`text-2xl font-bold mt-1 ${summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    Rp {summary.netBalance.toLocaleString('id-ID')}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg ${summary.netBalance >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
                                <DollarSign className={`w-5 h-5 ${summary.netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Transaction History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-5 py-4">Receipt No.</th>
                                <th className="px-5 py-4">Date</th>
                                <th className="px-5 py-4">Type</th>
                                <th className="px-5 py-4">Category</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4 text-right">Amount (Rp)</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">Loading records...</td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No transactions recorded yet.</td>
                                </tr>
                            ) : (
                                paginatedTransactions.map(trx => (
                                    <tr key={trx.id} className="hover:bg-gray-50/50">
                                        <td className="px-5 py-4 font-mono text-xs text-gray-500">{trx.receiptCode}</td>
                                        <td className="px-5 py-4 text-gray-900">{new Date(trx.date).toLocaleDateString()}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                trx.type === 'OFFERING' ? 'bg-blue-100 text-blue-700' :
                                                trx.type === 'DONATION' ? 'bg-purple-100 text-purple-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {trx.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600">{trx.category}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                trx.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                trx.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {trx.paymentStatus || 'COMPLETED'}
                                            </span>
                                        </td>
                                        <td className={`px-5 py-4 text-right font-medium ${trx.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'}`}>
                                            {trx.type === 'EXPENSE' ? '-' : '+'}
                                            {trx.amount.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {trx.paymentStatus === 'PENDING' && (
                                                    <button onClick={() => handleApprove(trx.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve Transaction">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleViewReceipt(trx)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View Receipt">
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(trx.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalRecords={transactions.length}
                    pageSize={pageSize}
                    onPageSizeChange={(size) => {
                        localStorage.setItem(`pageSize_${getTenantId()}`, size.toString());
                        setCurrentPage(1);
                    }}
                />
            </div>

                </>
            )}

            {activeTab === 'PROJECTS' && <FinanceProjects />}
            {activeTab === 'PLEDGES' && <FinancePledges />}
            {activeTab === 'BUDGET' && <FinanceBudget />}
            {activeTab === 'DONORS' && <DonorStatements />}

            <TransactionForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={fetchData}
            />

            <ReceiptViewer
                isOpen={!!receiptData}
                transaction={receiptData}
                onClose={() => setReceiptData(null)}
            />

            {/* Premium Confirm Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm no-print">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
                            <p className="text-gray-500 text-sm mb-6">{confirmModal.message}</p>
                            <div className="flex justify-end gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                >
                                    Batal
                                </Button>
                                <Button 
                                    onClick={() => {
                                        confirmModal.onConfirm();
                                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Konfirmasi
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


