import { useState, useEffect, useRef } from 'react';
import { Search, QrCode, UserCheck, Play, StopCircle, X, XCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../lib/axios';

export default function CheckInPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const lastScannedRef = useRef<string | null>(null);
    const lastScannedTimeRef = useRef<number>(0);
    const isProcessingRef = useRef<boolean>(false);

    useEffect(() => {
        fetchData();
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, []);

    const fetchData = async () => {
        try {
            const [membersRes, servicesRes, eventsRes] = await Promise.all([
                api.get('/members'),
                api.get('/attendance/services'),
                api.get('/events')
            ]);
            setMembers(membersRes.data);
            setServices(servicesRes.data);
            setEvents(eventsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (memberId: string, method: string = 'MANUAL') => {
        if (!selectedSession) {
            setStatusMessage({ text: "Please select a service or event first!", type: 'error' });
            return;
        }
        try {
            await api.post('/attendance/check-in', {
                memberId,
                worshipServiceId: selectedSession.type === 'SERVICE' ? selectedSession.id : undefined,
                eventId: selectedSession.type === 'EVENT' ? selectedSession.id : undefined,
                method
            });
            setStatusMessage({ text: "Check-in successful!", type: 'success' });
            setTimeout(() => {
                setStatusMessage(prev => prev?.text === "Check-in successful!" ? null : prev);
            }, 3000);
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.error || err.message || "Gagal melakukan check-in.";
            
            let displayMsg = errorMsg;
            if (errorMsg.includes('already checked in')) {
                displayMsg = "Jemaat ini sudah melakukan check-in untuk sesi hari ini.";
            }

            setStatusMessage({ text: displayMsg, type: 'error' });
            setTimeout(() => {
                setStatusMessage(prev => prev?.text === displayMsg ? null : prev);
            }, 4000);
        }
    };

    const startScanner = () => {
        setIsScanning(true);
        setTimeout(() => {
            scannerRef.current = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );
            scannerRef.current.render(onScanSuccess, onScanFailure);
        }, 100);
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().then(() => {
                setIsScanning(false);
                scannerRef.current = null;
            }).catch(console.error);
        } else {
            setIsScanning(false);
        }
    };

    const onScanSuccess = async (decodedText: string) => {
        const now = Date.now();
        // Cooldown: Ignore if it's the exact same code scanned within the last 3.5 seconds
        if (decodedText === lastScannedRef.current && now - lastScannedTimeRef.current < 3500) {
            return;
        }

        if (isProcessingRef.current) {
            return;
        }

        lastScannedRef.current = decodedText;
        lastScannedTimeRef.current = now;
        isProcessingRef.current = true;

        try {
            await handleCheckIn(decodedText, 'QR');
        } finally {
            isProcessingRef.current = false;
        }
    };

    const onScanFailure = () => {
        // Ignore failures
    };

    const filteredMembers = members.filter(m =>
        m.firstName.toLowerCase().includes(search.toLowerCase()) ||
        m.lastName?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading check-in system...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Start Check-in</h2>

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">1. Select Session</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {services.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedSession({ ...s, type: 'SERVICE' })}
                                className={`p-4 text-left border rounded-xl transition-all relative flex flex-col justify-between ${
                                    selectedSession?.id === s.id && selectedSession?.type === 'SERVICE'
                                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600 shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                            >
                                <div>
                                    <p className="font-bold text-gray-900 pr-6">{s.name}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Recurring Service</p>
                                </div>
                                {selectedSession?.id === s.id && selectedSession?.type === 'SERVICE' && (
                                    <span className="absolute top-3 right-3 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        ))}
                        {events.map(e => (
                            <button
                                key={e.id}
                                onClick={() => setSelectedSession({ ...e, type: 'EVENT' })}
                                className={`p-4 text-left border rounded-xl transition-all relative flex flex-col justify-between ${
                                    selectedSession?.id === e.id && selectedSession?.type === 'EVENT'
                                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600 shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                            >
                                <div>
                                    <p className="font-bold text-gray-900 pr-6">{e.title}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Program / Event</p>
                                </div>
                                {selectedSession?.id === e.id && selectedSession?.type === 'EVENT' && (
                                    <span className="absolute top-3 right-3 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {selectedSession && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    {/* Manual Search */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[600px] flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-indigo-600" />
                            Manual Check-in
                        </h3>
                        <div className="relative mb-4">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                placeholder="Search member name..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {filteredMembers.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => handleCheckIn(m.id)}
                                    className="w-full p-3 flex items-center justify-between border border-gray-50 rounded-lg hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                                            {m.firstName[0]}{m.lastName?.[0] || ''}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-gray-900">{m.firstName} {m.lastName}</p>
                                            <p className="text-xs text-gray-500">{m.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded">IN</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* QR Code Scanner */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                        <QrCode className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="font-bold text-gray-900 mb-2">QR Code Scanner</h3>
                        <p className="text-sm text-gray-500 mb-6 px-8">Point the camera at the QR Code found in the member's confirmation email.</p>

                        {!isScanning ? (
                            <button
                                onClick={startScanner}
                                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all"
                            >
                                <Play className="w-4 h-4" />
                                Start Camera
                            </button>
                        ) : (
                            <div className="w-full space-y-4">
                                <div id="reader" className="w-full overflow-hidden rounded-lg border-2 border-indigo-100"></div>
                                <button
                                    onClick={stopScanner}
                                    className="px-6 py-2 bg-red-100 text-red-700 rounded-lg font-bold flex items-center gap-2 mx-auto hover:bg-red-200 transition-colors"
                                >
                                    <StopCircle className="w-4 h-4" />
                                    Stop Scanner
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {statusMessage && (
                <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-right-4 z-50 ${
                    statusMessage.type === 'success' 
                        ? 'bg-green-600 text-white border-green-500 shadow-green-600/20' 
                        : 'bg-red-600 text-white border-red-500 shadow-red-600/20'
                }`}>
                    {statusMessage.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <XCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium text-sm">{statusMessage.text}</span>
                    <button onClick={() => setStatusMessage(null)}><X className="w-4 h-4 opacity-70" /></button>
                </div>
            )}
        </div>
    );
}

const CheckCircle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);
