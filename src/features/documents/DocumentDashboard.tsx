import React, { useState, useEffect } from 'react';
import { FolderOpen, BookOpen, Award, FileCode } from 'lucide-react';
import api from '../../lib/axios';
import { documentService } from './documentService';
import type { Document, Certificate, CertificateTemplate } from './documentService';
import LibraryView from './LibraryView';
import CertificatesView from './CertificatesView';
import TemplatesView from './TemplatesView';

type TabId = 'LIBRARY' | 'CERTIFICATES' | 'TEMPLATES';

export default function DocumentDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('LIBRARY');
  const [members, setMembers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, docs, certs, tmpls] = await Promise.all([
        api.get('/members'),
        documentService.getDocuments(),
        documentService.getCertificates(),
        documentService.getTemplates(),
      ]);
      setMembers(mRes.data || []);
      setDocuments(docs);
      setCertificates(certs);
      setTemplates(tmpls);
    } catch (err) {
      console.error('Error fetching document data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const tabs = [
    { id: 'LIBRARY', name: 'Perpustakaan Digital', icon: BookOpen, color: 'text-blue-500' },
    { id: 'CERTIFICATES', name: 'Sertifikat Jemaat', icon: Award, color: 'text-amber-500' },
    { id: 'TEMPLATES', name: 'Template Sertifikat', icon: FileCode, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <FolderOpen className="w-8 h-8 text-blue-200" />
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Manajemen Dokumen</h1>
            </div>
            <p className="mt-2 text-blue-100 text-sm md:text-base max-w-2xl">
              Kelola perpustakaan digital khotbah & materi pengajaran, sertifikat jemaat (baptis, nikah, sidi), serta template sertifikat gereja.
            </p>
          </div>
          <button onClick={fetchData} className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white font-semibold text-sm rounded-xl backdrop-blur-md border border-white/20">
            Refresh Data
          </button>
        </div>
        {/* Stats Row */}
        <div className="relative z-10 mt-6 grid grid-cols-3 gap-4">
          {[
            { label: 'Dokumen', value: documents.length, icon: '📄' },
            { label: 'Sertifikat', value: certificates.length, icon: '🏅' },
            { label: 'Template', value: templates.length, icon: '📋' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
              <p className="text-xl">{s.icon}</p>
              <p className="text-xl font-extrabold">{s.value}</p>
              <p className="text-xs text-blue-200 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto bg-white rounded-t-2xl px-4 shadow-sm border border-gray-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`flex items-center gap-2.5 px-6 py-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : tab.color}`} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-b-2xl shadow-sm border border-t-0 border-gray-100 min-h-[500px]">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm font-medium">Memuat data dokumen...</p>
          </div>
        ) : (
          <>
            {activeTab === 'LIBRARY' && <LibraryView documents={documents} onRefresh={fetchData} />}
            {activeTab === 'CERTIFICATES' && <CertificatesView certificates={certificates} members={members} templates={templates} onRefresh={fetchData} />}
            {activeTab === 'TEMPLATES' && <TemplatesView templates={templates} onRefresh={fetchData} />}
          </>
        )}
      </div>
    </div>
  );
}
