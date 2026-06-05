import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { PieChart, AlertCircle, Edit2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';

export default function FinanceBudget() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState<number | ''>(new Date().getMonth() + 1);
    const [variances, setVariances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchVariance = async () => {
        setLoading(true);
        try {
            const params: any = { year };
            if (month) params.month = month;
            const res = await api.get('/finance/advanced/budgets/variance', { params });
            setVariances(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVariance();
    }, [year, month]);

    const handleSetBudget = async (category: string, amount: number) => {
        try {
            await api.post('/finance/advanced/budgets', {
                year,
                month: month || undefined,
                category,
                amount
            });
            fetchVariance();
        } catch (err) {
            alert('Failed to update budget');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <PieChart className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Budget vs Actuals</h3>
                        <p className="text-xs text-gray-500">Analyze spending efficiency</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select value={month} onChange={e => setMonth(e.target.value ? parseInt(e.target.value) : '')} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
                        <option value="">Full Year</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {variances.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(v => (
                    <div key={v.category} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-gray-900">{v.category}</h4>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                    v.percentUsed > 100 ? 'bg-red-100 text-red-700' : 
                                    v.percentUsed > 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                }`}>
                                    {v.percentUsed.toFixed(1)}% Used
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-400 uppercase">Budgeted</p>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">Rp {v.budgeted.toLocaleString('id-ID')}</span>
                                    <button onClick={() => {
                                        const newAmount = prompt(`Update budget for ${v.category}:`, v.budgeted.toString());
                                        if (newAmount !== null) handleSetBudget(v.category, parseFloat(newAmount));
                                    }} className="p-1 hover:bg-gray-100 rounded text-gray-400">
                                        <Edit2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-400 uppercase">Actual Spending</p>
                                <p className="font-bold text-gray-900">Rp {v.actual.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-400 uppercase">Remaining</p>
                                <p className={`font-bold ${v.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    Rp {v.variance.toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`h-2 transition-all duration-500 ${
                                    v.percentUsed > 100 ? 'bg-red-500' : 
                                    v.percentUsed > 80 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(v.percentUsed, 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
                
                <Pagination 
                    currentPage={currentPage}
                    totalPages={Math.ceil(variances.length / pageSize)}
                    onPageChange={setCurrentPage}
                    totalRecords={variances.length}
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                />
                
                {variances.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No budget entries found for this period.</p>
                        <Button onClick={() => {
                            const cat = prompt('Category Name:');
                            const amt = prompt('Budget Amount:');
                            if (cat && amt) handleSetBudget(cat, parseFloat(amt));
                        }} variant="outline" className="mt-4">
                            Add First Budget Entry
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
