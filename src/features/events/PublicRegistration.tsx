import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, CheckCircle, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { API_BASE_URL } from '../../lib/config';

function formatSchedule(startDateStr?: string, endDateStr?: string) {
    if (!startDateStr) return null;
    try {
        const start = new Date(startDateStr);
        const end = endDateStr ? new Date(endDateStr) : null;

        const isSameDay = end ? start.toDateString() === end.toDateString() : true;

        const dateStr = start.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const fullDateRangeStr = (!isSameDay && end)
            ? `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
            : dateStr;

        const startTimeStr = start.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        }).replace('.', ':');

        const endTimeStr = end ? end.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        }).replace('.', ':') : null;

        return {
            dateStr: fullDateRangeStr,
            startTimeStr,
            endTimeStr,
            timeRangeStr: endTimeStr ? `${startTimeStr} - ${endTimeStr} WIB` : `${startTimeStr} WIB`
        };
    } catch {
        return null;
    }
}

export default function PublicRegistration() {
    const { id } = useParams();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [registrationId, setRegistrationId] = useState('');

    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/events/public/${id}`);
                setEvent(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch event info", err);
                setErrorMsg("Event not found or registration is closed.");
                setLoading(false);
            }
        };
        if (id) fetchEvent();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');
        try {
            const res = await axios.post(`${API_BASE_URL}/events/${id}/register`, form);
            if (res.data?.id) {
                setRegistrationId(res.data.id);
            }
            setSuccess(true);
        } catch (error: any) {
            setErrorMsg(error.response?.data?.error || 'Registration failed. The event might be full or closed.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

    const schedule = event ? formatSchedule(event.startDate, event.endDate) : null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80")' }}>
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"></div>

            <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-100">
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-indigo-200/50">
                            <Calendar className="w-7 h-7 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{event?.title || 'Pendaftaran Acara'}</h2>
                        {event?.description && <p className="text-gray-500 text-sm mt-2 leading-relaxed">{event.description}</p>}

                        {/* Event Date, Time (Jam Mulai & Berakhir), and Location */}
                        {schedule && (
                            <div className="mt-5 p-4 bg-indigo-50/70 rounded-xl border border-indigo-100 text-left space-y-2.5">
                                <div className="flex items-center text-sm text-gray-800">
                                    <Calendar className="w-4 h-4 mr-2.5 text-indigo-600 shrink-0" />
                                    <span className="font-semibold text-gray-900">{schedule.dateStr}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-800">
                                    <Clock className="w-4 h-4 mr-2.5 text-indigo-600 shrink-0" />
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs text-gray-500 font-medium">Jam:</span>
                                        <span className="font-bold text-indigo-900">{schedule.startTimeStr}</span>
                                        <span className="text-xs text-gray-400">s/d</span>
                                        <span className="font-bold text-indigo-900">{schedule.endTimeStr || 'Selesai'}</span>
                                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded ml-0.5">WIB</span>
                                    </div>
                                </div>
                                {event?.location && (
                                    <div className="flex items-start text-xs text-gray-600 pt-2 border-t border-indigo-100/70">
                                        <MapPin className="w-3.5 h-3.5 mr-2 text-indigo-500 shrink-0 mt-0.5" />
                                        <span>{event.location}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {!schedule && event?.location && (
                            <div className="flex items-center justify-center text-xs text-gray-400 mt-2">
                                <MapPin className="w-3 h-3 mr-1" /> {event.location}
                            </div>
                        )}
                    </div>

                    {success ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h3>
                            <p className="text-gray-600 text-sm mb-6">
                                Terima kasih telah mendaftar. Data Anda telah tercatat sebagai peserta kegiatan ini.
                            </p>
                            
                            {registrationId && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center mb-6 shadow-sm">
                                    <div className="w-full text-center pb-3 mb-3 border-b border-gray-200">
                                        <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider mb-0.5">Tiket Kegiatan</p>
                                        <p className="text-base font-bold text-gray-900">{event?.title}</p>
                                        {schedule && (
                                            <div className="text-xs text-gray-600 mt-1.5 space-y-0.5">
                                                <p className="font-medium">📅 {schedule.dateStr}</p>
                                                <p className="font-semibold text-indigo-700">⏰ {schedule.startTimeStr} - {schedule.endTimeStr || 'Selesai'} WIB</p>
                                                {event?.location && <p className="text-gray-500">📍 {event.location}</p>}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 font-bold mb-2">Tunjukkan QR Code ini kepada petugas check-in:</p>
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${registrationId}`} 
                                        alt="Registration QR Code"
                                        className="w-44 h-44 border-2 border-white rounded-lg shadow-sm"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2 font-mono">{registrationId}</p>
                                    <p className="text-[10px] text-indigo-600 mt-1 font-medium italic">Silakan screenshot/simpan gambar ini untuk check-in di lokasi.</p>
                                </div>
                            )}

                            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium text-sm flex items-center justify-center">
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Kembali ke Halaman Utama
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {errorMsg && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                                    {errorMsg}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <div className="mt-1">
                                    <input
                                        required
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <div className="mt-1">
                                    <input
                                        required
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="+62 812..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address (Optional)</label>
                                <div className="mt-1">
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 shadow-md" disabled={submitting}>
                                {submitting ? 'Processing...' : 'Register Now'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
