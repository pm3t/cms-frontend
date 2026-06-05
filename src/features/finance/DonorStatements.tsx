import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { FileText, Printer, Search, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import Select from 'react-select';

export default function DonorStatements() {
    const [members, setMembers] = useState<any[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [statement, setStatement] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        api.get('/members').then(res => setMembers(res.data));
    }, []);

    const fetchStatement = async () => {
        if (!selectedMemberId) return;
        setLoading(true);
        try {
            const res = await api.get(`/finance/donor-statement/${selectedMemberId}`, { params: { year } });
            setStatement(res.data);
        } catch (err) {
            alert('Failed to fetch statement');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm no-print">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Laporan Donatur (Tax Statement)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Select Donor</label>
                        <Select 
                            options={members.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName || ''}`.trim() }))}
                            value={members.find(m => m.id === selectedMemberId) ? { value: selectedMemberId, label: `${members.find(m => m.id === selectedMemberId)?.firstName} ${members.find(m => m.id === selectedMemberId)?.lastName || ''}`.trim() } : null}
                            onChange={(selected: any) => setSelectedMemberId(selected ? selected.value : '')}
                            isClearable
                            placeholder="Search member by typing..."
                            className="text-sm font-normal text-gray-800"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Fiscal Year</label>
                        <select 
                            value={year} 
                            onChange={e => setYear(parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                        >
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <Button onClick={fetchStatement} disabled={!selectedMemberId || loading} className="bg-blue-600 hover:bg-blue-700">
                        <Search className="w-4 h-4 mr-2" />
                        Generate Report
                    </Button>
                </div>
            </div>

            {statement && (
                <div className="bg-white p-10 rounded-xl border border-gray-100 shadow-sm print:shadow-none print:border-none print:p-0">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Tax Statement</h2>
                            <p className="text-gray-500 mt-1">Fiscal Year: {statement.year}</p>
                        </div>
                        <div className="text-right">
                            <Button onClick={handlePrint} variant="outline" className="no-print">
                                <Printer className="w-4 h-4 mr-2" />
                                Print Report
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10 mb-10 pb-8 border-b border-gray-100">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Donor Information</p>
                            <div className="mt-2 space-y-1">
                                <p className="font-bold text-lg text-gray-900">
                                    {members.find(m => m.id === selectedMemberId)?.firstName} {members.find(m => m.id === selectedMemberId)?.lastName}
                                </p>
                                <p className="text-gray-600 text-sm">{members.find(m => m.id === selectedMemberId)?.address || 'No address provided'}</p>
                                <p className="text-gray-600 text-sm">{members.find(m => m.id === selectedMemberId)?.phone}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Summary</p>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">Total Contribution</p>
                                <p className="text-3xl font-black text-green-600">Rp {statement.totalAmount.toLocaleString('id-ID')}</p>
                                <p className="text-xs text-gray-400 mt-1">Total {statement.donationCount} successful donations</p>
                            </div>
                        </div>
                    </div>

                    <table className="w-full text-left text-sm mb-10">
                        <thead>
                            <tr className="border-b-2 border-gray-900 font-bold text-gray-900 uppercase text-[10px] tracking-widest">
                                <th className="py-3">Date</th>
                                <th className="py-3">Description</th>
                                <th className="py-3">Project / Purpose</th>
                                <th className="py-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {statement.records.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((r: any) => (
                                <tr key={r.id}>
                                    <td className="py-4 text-gray-500">{new Date(r.date).toLocaleDateString()}</td>
                                    <td className="py-4 text-gray-900 font-medium">{r.description}</td>
                                    <td className="py-4 text-gray-600 italic">{r.project?.name || 'General Donation'}</td>
                                    <td className="py-4 text-right font-bold text-gray-900">Rp {r.amount.toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="no-print">
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={Math.ceil(statement.records.length / pageSize)}
                            onPageChange={setCurrentPage}
                            totalRecords={statement.records.length}
                            pageSize={pageSize}
                            onPageSizeChange={setPageSize}
                        />
                    </div>

                    <div className="mt-20 pt-10 border-t border-gray-100 text-center text-xs text-gray-400">
                        <p>This is an official document generated by Eklesia.</p>
                        <p>Printed on: {new Date().toLocaleString()}</p>
                    </div>
                </div>
            )}
            
            {!statement && !loading && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select a donor and year to generate their statement.</p>
                </div>
            )}
        </div>
    );
}
