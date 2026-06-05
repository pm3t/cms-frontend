import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { ArrowLeft, Save, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function MeetingDetail() {
    const { id, meetingId } = useParams<{ id: string, meetingId: string }>();
    const navigate = useNavigate();
    const [meeting, setMeeting] = useState<any>(null);
    const [groupMembers, setGroupMembers] = useState<any[]>([]);
    
    // Map of memberId -> status
    const [attendanceState, setAttendanceState] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchData();
    }, [id, meetingId]);

    const fetchData = async () => {
        try {
            const [groupRes, meetingRes] = await Promise.all([
                api.get(`/groups/${id}`),
                api.get(`/groups/meetings/${meetingId}`)
            ]);

            const members = groupRes.data.members || [];
            setGroupMembers(members);
            
            const m = meetingRes.data;
            setMeeting(m);

            // Initialize attendance state from existing meeting records
            const initState: Record<string, string> = {};
            
            // Set default present
            members.forEach((gm: any) => {
                initState[gm.memberId] = 'PRESENT';
            });

            // Override with actual data
            (m.attendance || []).forEach((att: any) => {
                initState[att.memberId] = att.status;
            });

            setAttendanceState(initState);

        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveAttendance = async () => {
        try {
            const attendances = Object.keys(attendanceState).map(memberId => ({
                memberId,
                status: attendanceState[memberId]
            }));

            await api.post(`/groups/meetings/${meetingId}/attendance`, {
                attendances
            });

            alert('Attendance saved successfully!');
            navigate(`/small-groups/${id}`);
        } catch (err) {
            alert('Failed to save attendance');
        }
    };

    if (!meeting) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(`/small-groups/${id}`)} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{meeting.title || 'Regular Meeting'}</h2>
                    <p className="text-sm text-gray-500">{new Date(meeting.date).toLocaleString()} • {meeting.group?.name}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Attendance Tracking</h3>
                        <Button onClick={handleSaveAttendance}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Attendance
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {groupMembers.map((gm: any) => {
                            const status = attendanceState[gm.memberId] || 'PRESENT';
                            
                            return (
                                <div key={gm.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <div className="font-medium text-gray-900">
                                        {gm.member.firstName} {gm.member.lastName}
                                    </div>
                                    <div className="flex bg-gray-100 p-1 rounded-lg">
                                        <button 
                                            onClick={() => setAttendanceState(prev => ({...prev, [gm.memberId]: 'PRESENT'}))}
                                            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${status === 'PRESENT' ? 'bg-green-500 text-white shadow' : 'text-gray-500 hover:text-green-600'}`}
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Present
                                        </button>
                                        <button 
                                            onClick={() => setAttendanceState(prev => ({...prev, [gm.memberId]: 'ABSENT'}))}
                                            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${status === 'ABSENT' ? 'bg-red-500 text-white shadow' : 'text-gray-500 hover:text-red-600'}`}
                                        >
                                            <XCircle className="w-4 h-4 mr-1.5" /> Absent
                                        </button>
                                        <button 
                                            onClick={() => setAttendanceState(prev => ({...prev, [gm.memberId]: 'EXCUSED'}))}
                                            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${status === 'EXCUSED' ? 'bg-yellow-500 text-white shadow' : 'text-gray-500 hover:text-yellow-600'}`}
                                        >
                                            <HelpCircle className="w-4 h-4 mr-1.5" /> Excused
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {groupMembers.length === 0 && (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                No members in this group to track attendance for.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
