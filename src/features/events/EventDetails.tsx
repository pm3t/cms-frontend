import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle, XCircle, Trash2, Bell } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function EventDetails() {
    const { id } = useParams();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sendingReminders, setSendingReminders] = useState(false);

    const fetchDetails = async () => {
        try {
            const res = await api.get(`/events/${id}`);
            setEvent(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const handleCheckIn = async (regId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ATTENDED' ? 'REGISTERED' : 'ATTENDED';
        try {
            await api.patch(`/events/${id}/registrations/${regId}/checkin`, { status: newStatus });
            fetchDetails();
        } catch (err) {
            alert('Failed to check in');
        }
    };

    const handleRemoveReg = async (regId: string) => {
        if (!confirm('Cancel this registration?')) return;
        try {
            await api.patch(`/events/${id}/registrations/${regId}/checkin`, { status: 'CANCELLED' });
            fetchDetails();
        } catch {
            alert('Failed to cancel');
        }
    };

    const handleSendReminders = async () => {
        if (!confirm('Send reminder emails to all confirmed and waitlisted registrants?')) return;
        setSendingReminders(true);
        try {
            const res = await api.post(`/events/${id}/remind-all`, {});
            alert(`Reminders sent successfully to ${res.data.count} people!`);
        } catch (err) {
            alert('Failed to send reminders.');
        } finally {
            setSendingReminders(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
    if (!event) return <div className="p-8 text-center text-red-500">Event not found</div>;

    const registered = event.registrations.filter((r: any) => r.status === 'REGISTERED').length;
    const waitlisted = event.registrations.filter((r: any) => r.status === 'WAITLISTED').length;
    const attended = event.registrations.filter((r: any) => r.status === 'ATTENDED').length;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/events" className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {new Date(event.startDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} • {event.location || 'No location'}
                    </p>
                </div>
                <div className="ml-auto">
                    <Button
                        onClick={handleSendReminders}
                        disabled={sendingReminders || event.registrations.length === 0}
                        variant="outline"
                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                        <Bell className="w-4 h-4 mr-2" />
                        {sendingReminders ? 'Sending...' : 'Send Reminders'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                    <p className="text-sm font-medium text-gray-500">Capacity</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{event.capacity || 'Unlimited'}</p>
                </div>
                <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-5 text-center">
                    <p className="text-sm font-medium text-blue-600">Registered</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{registered}</p>
                </div>
                <div className="bg-orange-50 rounded-xl shadow-sm border border-orange-100 p-5 text-center">
                    <p className="text-sm font-medium text-orange-600">Waitlisted</p>
                    <p className="text-3xl font-bold text-orange-900 mt-2">{waitlisted}</p>
                </div>
                <div className="bg-green-50 rounded-xl shadow-sm border border-green-100 p-5 text-center">
                    <p className="text-sm font-medium text-green-600">Attended (Checked In)</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">{attended}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-gray-800">Registrants ({event.registrations.length})</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/80 text-gray-600 font-medium">
                            <tr>
                                <th className="px-5 py-4">Name</th>
                                <th className="px-5 py-4">Contact</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Check-in Time</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {event.registrations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No registrations yet.</td>
                                </tr>
                            ) : (
                                event.registrations.map((reg: any) => (
                                    <tr key={reg.id} className="hover:bg-gray-50/50">
                                        <td className="px-5 py-4 font-semibold text-gray-900">{reg.name}</td>
                                        <td className="px-5 py-4 text-gray-500 text-xs">
                                            {reg.email && <div>{reg.email}</div>}
                                            {reg.phone && <div>{reg.phone}</div>}
                                            {!reg.email && !reg.phone && '-'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold \${
                                                reg.status === 'ATTENDED' ? 'bg-green-100 text-green-700' :
                                                reg.status === 'REGISTERED' ? 'bg-blue-100 text-blue-700' :
                                                reg.status === 'WAITLISTED' ? 'bg-orange-100 text-orange-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {reg.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-500 text-xs">
                                            {reg.checkInTime ? new Date(reg.checkInTime).toLocaleTimeString('id-ID') : '-'}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {reg.status !== 'CANCELLED' && (
                                                    <Button
                                                        variant={reg.status === 'ATTENDED' ? 'outline' : 'primary'}
                                                        size="sm"
                                                        onClick={() => handleCheckIn(reg.id, reg.status)}
                                                        className={reg.status === 'ATTENDED' ? 'text-gray-600' : 'bg-green-600 hover:bg-green-700 border-none'}
                                                    >
                                                        {reg.status === 'ATTENDED' ? <XCircle className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                                                        {reg.status === 'ATTENDED' ? 'Undo Check-in' : 'Check In'}
                                                    </Button>
                                                )}
                                                <button onClick={() => handleRemoveReg(reg.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
