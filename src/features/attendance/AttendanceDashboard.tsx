import { useState, useEffect } from 'react';
import { Users, UserX, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../../lib/axios';
import { Link } from 'react-router-dom';

export default function AttendanceDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [absentees, setAbsentees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, historyRes, absenteesRes] = await Promise.all([
                    api.get('/attendance/stats'),
                    api.get('/attendance/history'),
                    api.get('/attendance/alerts/absentees')
                ]);
                setStats(statsRes.data);
                setHistory(historyRes.data);
                setAbsentees(absenteesRes.data);
            } catch (err) {
                console.error("Failed to fetch attendance data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading attendance data...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Attendance Tracking</h2>
                    <p className="text-gray-500">Monitor engagement and manage check-ins</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Check-ins</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 rounded-lg text-red-600">
                            <UserX className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Absentees (3+ wks)</p>
                            <p className="text-2xl font-bold text-gray-900">{absentees.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-lg text-green-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Engagement Trend</p>
                            <p className="text-2xl font-bold text-gray-900">Steady</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Recent Check-ins</h3>
                        <Link to="/attendance/history" className="text-sm text-primary-600 hover:underline">View All</Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {history.length > 0 ? history.slice(0, 5).map((record) => (
                            <div key={record.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
                                        {record.member
                                            ? (record.member.firstName?.[0] || '') + (record.member.lastName?.[0] || '')
                                            : record.guestName?.[0] || 'G'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {record.member
                                                ? record.member.firstName + ' ' + (record.member.lastName || '')
                                                : record.guestName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {record.worshipService?.name || record.event?.title || 'Unknown session'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-gray-900">{new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{record.method}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-gray-400 text-sm">No recent attendance records</div>
                        )}
                    </div>
                </div>

                {/* Absentee Follow-up */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50/30">
                        <h3 className="font-semibold text-red-900 flex items-center gap-2">
                            <UserX className="w-4 h-4" />
                            Absentee Follow-up
                        </h3>
                        <span className="text-xs font-medium px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                            {absentees.length} Members
                        </span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {absentees.length > 0 ? absentees.slice(0, 5).map((member) => (
                            <div key={member.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                                    <p className="text-xs text-gray-500">{member.phone || 'No phone recorded'}</p>
                                </div>
                                <button
                                    onClick={() => alert(`Redirecting to communications for ${member.firstName}...`)}
                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-transparent hover:border-primary-100"
                                    title="Send Follow-up Message"
                                >
                                    <Mail className="w-4 h-4" />
                                </button>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-gray-400 text-sm">Everyone has been active lately!</div>
                        )}
                        {absentees.length > 5 && (
                            <div className="px-6 py-3 bg-gray-50 text-center">
                                <Link to="/attendance/alerts" className="text-xs font-medium text-gray-600 hover:text-primary-600 flex items-center justify-center gap-1">
                                    View all absentees <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const Mail = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);
