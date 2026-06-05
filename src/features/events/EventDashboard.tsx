import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Calendar, MapPin, Users, Plus, Pencil, Trash2, ChevronRight, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import EventForm from './EventForm';
import { Link } from 'react-router-dom';

export default function EventDashboard() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);

    const getTenantId = () => {
        const token = localStorage.getItem('token');
        if (!token) return 'global';
        try { return JSON.parse(atob(token.split('.')[1])).tenantId; } catch { return 'global'; }
    };

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSizeStr = localStorage.getItem(`pageSize_${getTenantId()}`) || '10';
    const parsedSize = parseInt(pageSizeStr);
    const pageSize = pageSizeStr === 'All' ? Math.max(events.length, 1) : (isNaN(parsedSize) ? 10 : parsedSize);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/events?includeClosed=true');
            setEvents(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event? All registrations will be lost.')) return;
        try {
            await api.delete(`/events/${id}`);
            fetchEvents();
        } catch {
            alert('Failed to delete');
        }
    };

    const openCreate = () => {
        setEditingEvent(null);
        setIsFormOpen(true);
    };

    const openEdit = (e: any) => {
        setEditingEvent(e);
        setIsFormOpen(true);
    };

    // Calculate pagination variables
    const totalPages = pageSizeStr === 'All' ? 1 : Math.max(Math.ceil(events.length / pageSize), 1);
    const paginatedEvents = pageSizeStr === 'All' ? events : events.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-indigo-500 pb-1 inline-block">
                        Events & Programs
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">Manage church events, services, and track capacities.</p>
                </div>
                <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-800">Upcoming Events</h3>
                </div>

                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading events...</div>
                    ) : events.length === 0 ? (
                        <div className="p-12 text-center">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No events scheduled.</p>
                            <p className="text-gray-400 text-sm mt-1">Create an event to start accepting registrations.</p>
                        </div>
                    ) : (
                        paginatedEvents.map(event => {
                            const dateObj = new Date(event.startDate);
                            const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                            const day = dateObj.getDate();

                            const isPast = new Date(event.endDate) < new Date();
                            const capacityFull = event.capacity && event._count.registrations >= event.capacity;

                            return (
                                <div key={event.id} className={`p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center transition-colors hover:bg-gray-50 \${isPast ? 'opacity-60' : ''}`}>
                                    {/* Date Block */}
                                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm shrink-0">
                                        <span className="text-xs font-bold text-indigo-600 mb-0.5">{month}</span>
                                        <span className="text-xl font-black text-indigo-900 leading-none">{day}</span>
                                    </div>

                                    {/* Event Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-gray-900 truncate text-lg">{event.title}</h4>
                                            {!event.isRegistrationOpen && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded">Closed</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span>{dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span className="truncate max-w-[150px]">{event.location}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span className={capacityFull ? 'text-orange-600 font-semibold' : ''}>
                                                    {event._count.registrations} {event.capacity ? `/ ${event.capacity} ` : ''}
                                                    registrants
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-gray-100 sm:border-0">
                                        <Link to={`/events/${event.id}`} className="flex-1 sm:flex-none">
                                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                                <Users className="w-4 h-4 sm:mr-2" />
                                                <span className="hidden sm:inline">Manage</span>
                                            </Button>
                                        </Link>
                                        <button onClick={() => openEdit(event)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-100 transition-all">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <Link to={`/register-event/${event.id}`} target="_blank" title="Public Registration Link" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-all">
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 bg-gray-50">
                        <span className="text-sm text-gray-600 mb-4 sm:mb-0">
                            Showing page {currentPage} of {totalPages} ({events.length} total events)
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

            <EventForm
                isOpen={isFormOpen}
                event={editingEvent}
                onClose={() => setIsFormOpen(false)}
                onSuccess={fetchEvents}
            />
        </div>
    );
}
