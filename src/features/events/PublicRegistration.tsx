import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { API_BASE_URL } from '../../lib/config';

export default function PublicRegistration() {
    const { id } = useParams();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

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
            await axios.post(`${API_BASE_URL}/events/${id}/register`, form);
            setSuccess(true);
        } catch (error: any) {
            setErrorMsg(error.response?.data?.error || 'Registration failed. The event might be full or closed.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80")' }}>
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"></div>

            <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{event?.title || 'Event Registration'}</h2>
                        {event?.description && <p className="text-gray-500 text-sm mt-2">{event.description}</p>}
                        {event?.location && (
                            <div className="flex items-center justify-center text-xs text-gray-400 mt-2">
                                <MapPin className="w-3 h-3 mr-1" /> {event.location}
                            </div>
                        )}
                    </div>

                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
                            <p className="text-gray-600 mb-6">
                                Thank you for registering. You have been placed on the attendee list (or waitlist if full). We look forward to seeing you.
                            </p>
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium text-sm flex items-center justify-center">
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Return to Dashboard
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
