import React, { useState, useEffect } from 'react';
import { reportingService } from './reportingService';
import type { ReportModule, ReportTemplate } from './reportingService';
import { Settings2, Play, Save, Download, Trash2 } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const MODULES: {
  value: ReportModule;
  label: string;
  columns: {
    key: string;
    label: string;
    type?: 'text' | 'select';
    options?: { value: string; label: string }[];
  }[];
}[] = [
  {
    value: 'MEMBERSHIP',
    label: 'Data Jemaat',
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'firstName', label: 'Nama Depan', type: 'text' },
      { key: 'lastName', label: 'Nama Belakang', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      {
        key: 'gender',
        label: 'Gender',
        type: 'select',
        options: [
          { value: 'M', label: 'Laki-Laki' },
          { value: 'F', label: 'Perempuan' }
        ]
      },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' },
          { value: 'CANDIDATE', label: 'Candidate' },
          { value: 'GUEST', label: 'Guest' }
        ]
      },
      {
        key: 'category',
        label: 'Kategori',
        type: 'select',
        options: [
          { value: 'CHILDREN', label: 'Children' },
          { value: 'YOUTH', label: 'Youth' },
          { value: 'ADULT', label: 'Adult' },
          { value: 'ELDERLY', label: 'Elderly' }
        ]
      }
    ]
  },
  {
    value: 'ATTENDANCE',
    label: 'Kehadiran',
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'memberId', label: 'ID Jemaat', type: 'text' },
      { key: 'serviceId', label: 'ID Ibadah', type: 'text' },
      { key: 'checkInTime', label: 'Waktu Hadir', type: 'text' }
    ]
  },
  {
    value: 'FINANCE',
    label: 'Keuangan',
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'amount', label: 'Nominal', type: 'text' },
      {
        key: 'type',
        label: 'Tipe',
        type: 'select',
        options: [
          { value: 'OFFERING', label: 'Persembahan' },
          { value: 'DONATION', label: 'Donasi' },
          { value: 'EXPENSE', label: 'Pengeluaran' }
        ]
      },
      { key: 'date', label: 'Tanggal', type: 'text' },
      { key: 'description', label: 'Keterangan', type: 'text' }
    ]
  }
];

export default function CustomReportBuilder() {
  const [module, setModule] = useState<ReportModule>('MEMBERSHIP');
  const [selectedCols, setSelectedCols] = useState<string[]>(['firstName', 'lastName']);
  const [filters, setFilters] = useState<{ field: string; operator: string; value: string }[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');

  const fetchTemplates = () => reportingService.getTemplates().then(setTemplates).catch(console.error);
  useEffect(() => { fetchTemplates(); }, []);

  const handleToggleCol = (col: string) => {
    if (selectedCols.includes(col)) setSelectedCols(selectedCols.filter(c => c !== col));
    else setSelectedCols([...selectedCols, col]);
  };

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: 'EQUALS', value: '' }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, field: string) => {
    const colDef = currentMod?.columns.find(c => c.key === field);
    const updated = [...filters];
    updated[index] = {
      field,
      operator: 'EQUALS',
      value: colDef?.type === 'select' ? (colDef.options?.[0]?.value || '') : ''
    };
    setFilters(updated);
  };

  const updateFilter = (index: number, key: string, val: string) => {
    const updated = [...filters];
    updated[index] = { ...updated[index], [key]: val };
    setFilters(updated);
  };

  const handleExecute = async () => {
    setLoading(true);
    try {
      const data = await reportingService.executeCustomReport(module, { columns: selectedCols, filters });
      setResults(data);
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleSaveTemplate = async () => {
    if (!templateName) return alert('Nama template wajib diisi');
    try {
      await reportingService.saveTemplate({ name: templateName, module, config: { columns: selectedCols, filters }, isPublic: true });
      alert('Template disimpan!');
      setTemplateName('');
      fetchTemplates();
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Hapus template ini?')) return;
    try { await reportingService.deleteTemplate(id); fetchTemplates(); }
    catch (err: any) { alert(err.message); }
  };

  const exportCSV = () => {
    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `report_${module}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `report_${module}.xlsx`);
  };

  const currentMod = MODULES.find(m => m.value === module);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Builder Panel */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-gray-50">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Settings2 className="w-4 h-4" /> Konfigurasi Query</h3>
            
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-700 block mb-2">Pilih Sumber Data</label>
              <select value={module} onChange={e => { setModule(e.target.value as ReportModule); setSelectedCols([]); setResults([]); }} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {MODULES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-gray-700 block mb-2">Pilih Kolom Data</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {currentMod?.columns.map(c => (
                  <label key={c.key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedCols.includes(c.key)} onChange={() => handleToggleCol(c.key)} className="rounded text-blue-600 focus:ring-blue-500" />
                    {c.label} ({c.key})
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Section */}
            <div className="mb-6 border-t border-gray-200 pt-4">
              <label className="text-xs font-bold text-gray-700 block mb-2">Filter Data</label>
              <div className="space-y-3">
                {filters.map((filter, index) => {
                  const selectedColDef = currentMod?.columns.find(c => c.key === filter.field);
                  
                  return (
                    <div key={index} className="flex gap-1.5 items-center">
                      <select
                        value={filter.field}
                        onChange={e => handleFieldChange(index, e.target.value)}
                        className="border border-gray-200 rounded-xl px-2 py-1 text-xs bg-white w-[35%] focus:outline-none"
                      >
                        <option value="">-- Kolom --</option>
                        {currentMod?.columns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                      
                      <select
                        value={filter.operator}
                        onChange={e => updateFilter(index, 'operator', e.target.value)}
                        className="border border-gray-200 rounded-xl px-1 py-1 text-xs bg-white w-[25%] focus:outline-none"
                      >
                        <option value="EQUALS">=</option>
                        {selectedColDef?.type !== 'select' && <option value="CONTAINS">Contains</option>}
                      </select>

                      {selectedColDef?.type === 'select' ? (
                        <select
                          value={filter.value}
                          onChange={e => updateFilter(index, 'value', e.target.value)}
                          className="border border-gray-200 rounded-xl px-2 py-1 text-xs bg-white w-[30%] focus:outline-none min-w-0"
                        >
                          {selectedColDef.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={filter.value}
                          onChange={e => updateFilter(index, 'value', e.target.value)}
                          placeholder="Nilai..."
                          className="border border-gray-200 rounded-xl px-2 py-1 text-xs bg-white w-[30%] focus:outline-none min-w-0"
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => removeFilter(index)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded-md cursor-pointer flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={addFilter}
                  className="w-full py-1.5 border border-dashed border-gray-300 hover:border-gray-400 text-gray-600 font-bold text-xs rounded-xl cursor-pointer text-center"
                >
                  + Tambah Filter
                </button>
              </div>
            </div>

            <button onClick={handleExecute} disabled={loading || selectedCols.length === 0} className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl cursor-pointer flex justify-center items-center gap-2">
              <Play className="w-4 h-4" /> {loading ? 'Menjalankan...' : 'Jalankan Query'}
            </button>
          </div>

          <div className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-gray-50">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Save className="w-4 h-4" /> Simpan Template</h3>
            <input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Nama template..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3" />
            <button onClick={handleSaveTemplate} disabled={!templateName} className="w-full py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-800 font-bold text-sm rounded-xl cursor-pointer flex justify-center items-center gap-2">Simpan</button>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <p className="text-xs font-bold text-gray-500 mb-2">Template Tersimpan</p>
              <div className="space-y-2">
                {templates.map(t => (
                  <div key={t.id} className="flex items-center justify-between bg-white p-2 border border-gray-100 rounded-lg text-sm">
                    <span className="font-semibold text-gray-700 truncate cursor-pointer" onClick={() => { setModule(t.module); setSelectedCols(t.config.columns || []); setFilters(t.config.filters || []); }}>{t.name}</span>
                    <button onClick={() => handleDeleteTemplate(t.id)} className="text-red-500 hover:bg-red-50 p-1 rounded-md cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="w-full md:w-2/3 border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-900">Hasil Query ({results.length} baris)</h3>
            {results.length > 0 && (
              <div className="flex gap-2">
                <button onClick={exportCSV} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1"><Download className="w-3 h-3" /> CSV</button>
                <button onClick={exportExcel} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1"><Download className="w-3 h-3" /> Excel</button>
              </div>
            )}
          </div>
          
          <div className="overflow-x-auto h-[500px]">
            {results.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">Jalankan query untuk melihat hasil</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {selectedCols.map(c => <th key={c} className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase whitespace-nowrap">{c}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      {selectedCols.map(c => <td key={c} className="px-4 py-3 whitespace-nowrap text-gray-700">{String(row[c] ?? '-')}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
