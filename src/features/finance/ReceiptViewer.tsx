import React from 'react';
import { X, Printer } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { resolveFileUrl as getFileUrl } from '../../lib/config';

interface ReceiptViewerProps {
    isOpen: boolean;
    transaction: any;
    onClose: () => void;
}

export default function ReceiptViewer({ isOpen, transaction, onClose }: ReceiptViewerProps) {
    if (!isOpen || !transaction) return null;

    const handlePrint = () => {
        const printContent = document.getElementById('printable-receipt');
        if (!printContent) return;

        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Reload to restore React bindings
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Transaction Receipt</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:bg-gray-200 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 flex-1 overflow-auto" id="printable-receipt">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 uppercase">OFFICIAL RECEIPT</h2>
                        <p className="text-gray-500 text-sm mt-1">Eklesia</p>
                    </div>

                    <div className="border-t border-b border-gray-200 py-4 mb-6 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Receipt No:</span>
                            <span className="font-mono font-medium">{transaction.receiptCode}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Date:</span>
                            <span className="font-medium">{new Date(transaction.date).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Type:</span>
                            <span className="font-semibold">{transaction.type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Status:</span>
                            <span className={`font-semibold ${
                                transaction.paymentStatus === 'COMPLETED' ? 'text-green-600' :
                                transaction.paymentStatus === 'PENDING' ? 'text-yellow-600' :
                                'text-red-600'
                            }`}>{transaction.paymentStatus || 'COMPLETED'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Category:</span>
                            <span className="font-medium">{transaction.category}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                        <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {transaction.description}
                        </p>
                    </div>

                    {transaction.proofUrl && (
                        <div className="mb-6 no-print">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bukti Transfer</h4>
                            <a href={getFileUrl(transaction.proofUrl)} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-gray-200">
                                <img 
                                    src={getFileUrl(transaction.proofUrl)} 
                                    alt="Bukti Transfer" 
                                    className="w-full h-48 object-cover hover:opacity-90 transition-opacity" 
                                />
                            </a>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-8 pt-4 border-t-2 border-dashed border-gray-300">
                        <span className="text-lg font-bold text-gray-900">TOTAL AMOUNT</span>
                        <span className="text-2xl font-black text-primary-600">
                            Rp {transaction.amount.toLocaleString('id-ID')}
                        </span>
                    </div>

                    <div className="mt-8 text-center text-xs text-gray-400">
                        <p>Thank you for your generous contribution.</p>
                        <p>This is a computer generated receipt.</p>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print Receipt
                    </Button>
                </div>
            </div>
        </div>
    );
}
