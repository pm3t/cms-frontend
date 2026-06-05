import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { UploadCloud, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../lib/axios';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ImportMembersModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleProcess = () => {
        if (!file) return;
        setUploading(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonPayload = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                // Send JSON payload to backend
                await api.post('/members/import', {
                    members: jsonPayload
                });
                alert(`Successfully imported ${jsonPayload.length} members!`);
                onSuccess();
                onClose();
            } catch (error: any) {
                const errorMsg = error.response?.data?.error || error.message;
                const debugInfo = error.response?.data?.debug || 'No debug info';
                alert('Import failed: ' + errorMsg + ' / Debug: ' + debugInfo);
            } finally {
                setUploading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
                <div className="p-5 flex justify-between items-center border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900">Import Members (CSV)</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center bg-gray-50 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors">
                        <UploadCloud className="w-12 h-12 text-primary-500 mb-4" />
                        <p className="text-gray-700 font-medium mb-1">Upload the Member Registry Template</p>
                        <p className="text-gray-500 text-sm mb-4">Must be an Excel Worksheet (.xlsx, .xls) containing headers.</p>

                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        />
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} disabled={uploading}>Cancel</Button>
                    <Button onClick={handleProcess} disabled={!file || uploading}>
                        {uploading ? 'Processing...' : 'Start Import'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
