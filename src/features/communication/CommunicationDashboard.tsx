import React, { useState, useEffect } from 'react';
import { Mail, Edit2, Trash2, Send, Clock, Plus, X, MessageSquare, BookOpen, Smartphone } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import BulkMessaging from './BulkMessaging';
import NewsletterManagement from './NewsletterManagement';

import api from '../../lib/axios';

type Tab = 'TEMPLATES' | 'LOGS' | 'BULK' | 'NEWSLETTERS';

export default function CommunicationDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('TEMPLATES');

    // Templates State
    const [templates, setTemplates] = useState<any[]>([]);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [tName, setTName] = useState('');
    const [tSubject, setTSubject] = useState('');
    const [tBody, setTBody] = useState('');
    const [tChannel, setTChannel] = useState<'INBOX'>('INBOX');

    // Logs State
    const [logs, setLogs] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1); 
        if (activeTab === 'TEMPLATES') {
            fetchTemplates();
        } else if (activeTab === 'LOGS') {
            fetchLogs();
        }
    }, [activeTab]);

    const fetchTemplates = () => {
        api.get('/communications/templates')
            .then(res => setTemplates(res.data))
            .catch(console.error);
    };

    const fetchLogs = () => {
        api.get('/communications/logs')
            .then(res => setLogs(res.data))
            .catch(console.error);
    };

    const handleSaveTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { name: tName, subject: tSubject, body: tBody, channel: tChannel };
            if (editingTemplate) {
                await api.put(`/communications/templates/${editingTemplate.id}`, payload);
            } else {
                await api.post('/communications/templates', payload);
            }
            setIsTemplateModalOpen(false);
            fetchTemplates();
        } catch (err: any) {
            alert('Gagal menyimpan template: ' + (err.message || 'Error tidak diketahui'));
        }
    };

    const handleEditTemplate = (t: any) => {
        setEditingTemplate(t);
        setTName(t.name);
        setTSubject(t.subject);
        setTBody(t.body);
        setTChannel(t.channel || 'EMAIL');
        setIsTemplateModalOpen(true);
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm('Hapus template ini?')) return;
        try {
            await api.delete(`/communications/templates/${id}`);
            fetchTemplates();
        } catch {
            alert('Failed to delete template');
        }
    };

    const handleOpenNewTemplate = () => {
        setEditingTemplate(null);
        setTName('');
        setTSubject('');
        setTBody('');
        setTChannel('INBOX');
        setIsTemplateModalOpen(true);
    };

    const handleTestSend = async (t: any) => {
        const recipient = prompt(`Enter test recipient (${t.channel === 'EMAIL' ? 'email' : 'phone number'}):`);
        if (!recipient) return;

        try {
            await api.post('/communications/send', {
                recipient,
                subject: t.subject.replace('{{name}}', 'Test Recipient'),
                body: t.body.replace('{{name}}', 'Test Recipient'),
                channel: t.channel
            });

            alert(`${t.channel} queued!`);
            setActiveTab('LOGS');
        } catch (err) {
            alert(`Failed to send test ${t.channel}`);
        }
    };

    // Pagination logic for logs
    const getTenantId = () => {
        const token = localStorage.getItem('token');
        if (!token) return 'global';
        try { return JSON.parse(atob(token.split('.')[1])).tenantId; } catch { return 'global'; }
    };
    const pageSizeStr = localStorage.getItem(`pageSize_${getTenantId()}`) || '10';
    const parsedSize = parseInt(pageSizeStr);
    const pageSize = pageSizeStr === 'All' ? Math.max(logs.length, 1) : (isNaN(parsedSize) ? 10 : parsedSize);
    const totalPages = pageSizeStr === 'All' ? 1 : Math.max(Math.ceil(logs.length / pageSize), 1);

    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }
    const paginatedLogs = pageSizeStr === 'All' ? logs : logs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-8 h-8 text-primary-600" />
                        Communications Center
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Multi-channel messaging, bulk broadcasts, and digital bulletins.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100 uppercase text-[10px] font-black tracking-widest text-gray-500 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'TEMPLATES', label: 'Templates', icon: Mail },
                        { id: 'BULK', label: 'Bulk Send', icon: Send },
                        { id: 'NEWSLETTERS', label: 'Newsletters', icon: BookOpen },
                        { id: 'LOGS', label: 'History', icon: Clock },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`flex-1 min-w-[120px] py-4 px-2 text-center hover:bg-gray-50 transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30' : ''}`}
                            onClick={() => setActiveTab(tab.id as Tab)}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'TEMPLATES' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">Message Templates</h3>
                                <Button onClick={handleOpenNewTemplate} size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Template
                                </Button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {templates.map(t => (
                                    <div key={t.id} className="group border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-primary-200 transition-all bg-white relative">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-gray-900">{t.name}</h3>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter bg-blue-100 text-blue-700">
                                                    In-App Inbox
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleTestSend(t)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg" title="Send Test">
                                                    <Send className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleEditTemplate(t)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteTemplate(t.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600 mb-2">
                                            <span className="font-bold uppercase text-[10px] text-gray-400 block mb-0.5">Subject:</span> {t.subject}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-3 truncate bg-gray-50 p-3 rounded-lg font-mono">
                                            {t.body}
                                        </div>
                                    </div>
                                ))}
                                {templates.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                                        No templates found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'BULK' && <BulkMessaging />}
                    
                    {activeTab === 'NEWSLETTERS' && <NewsletterManagement />}

                    {activeTab === 'LOGS' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-800">Communication History</h3>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-4">Time</th>
                                            <th className="px-4 py-4">Channel</th>
                                            <th className="px-4 py-4">Recipient</th>
                                            <th className="px-4 py-4">Subject</th>
                                            <th className="px-4 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {paginatedLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-4 text-gray-500 text-xs">
                                                    {new Date(log.createdAt).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-gray-100 rounded-md text-gray-600">
                                                        {log.channel}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-900">{log.recipient}</td>
                                                <td className="px-4 py-4 text-gray-600 truncate max-w-[200px]">{log.subject}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                                        log.status === 'SENT' ? 'bg-green-100 text-green-700' :
                                                        log.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {logs.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                                    No communication logs available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'LOGS' && totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 bg-gray-50 mt-4 rounded-xl">
                            <span className="text-sm text-gray-600 mb-4 sm:mb-0">
                                Page {currentPage} of {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                    Previous
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Template Modal */}
            {isTemplateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="font-bold text-xl text-gray-900">
                                {editingTemplate ? 'Update Template' : 'Create New Template'}
                            </h3>
                            <button onClick={() => setIsTemplateModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveTemplate} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase text-gray-500 ml-1">Template Name</label>
                                    <input required type="text" value={tName} onChange={e => setTName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-gray-50/50" placeholder="e.g. Birthday Greetings" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase text-gray-500 ml-1">Channel</label>
                                    <select 
                                        value={tChannel} 
                                        onChange={e => setTChannel(e.target.value as any)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-gray-50/50"
                                    >
                                        <option value="INBOX">In-App Inbox</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase text-gray-500 ml-1">Message Subject</label>
                                <input required type="text" value={tSubject} onChange={e => setTSubject(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-gray-50/50" placeholder="e.g. Happy Birthday {{name}}!" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase text-gray-500 ml-1">Message Body</label>
                                <textarea required rows={5} value={tBody} onChange={e => setTBody(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-gray-50/50 font-mono text-sm" placeholder="Hi {{name}}, wishing you a blessed year..." />
                                <p className="text-[10px] text-gray-400 italic">Pro Tip: Use {'{{name}}'} to personalize the message automatically.</p>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="ghost" type="button" onClick={() => setIsTemplateModalOpen(false)}>Batal</Button>
                                <Button type="submit" className="px-8">
                                    {editingTemplate ? 'Update' : 'Save'} Template
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
