import { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, ShieldCheck, LogOut, Menu, Bell, Megaphone, Mail } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import SettingsLayout from '../settings/SettingsLayout';
import MembersDirectory from '../members/MembersDirectory';
import MemberProfile from '../members/MemberProfile';
import AnnouncementsList from '../communication/AnnouncementsList';
import CommunicationDashboard from '../communication/CommunicationDashboard';
import FinanceDashboard from '../finance/FinanceDashboard';
import EventDashboard from '../events/EventDashboard';
import EventDetails from '../events/EventDetails';
import { BadgeDollarSign, Calendar, History } from 'lucide-react';
import AttendanceDashboard from '../attendance/AttendanceDashboard';
import ServiceManager from '../attendance/ServiceManager';
import CheckInPage from '../attendance/CheckInPage';
import SmallGroupDashboard from '../smallGroups/SmallGroupDashboard';
import GroupDetail from '../smallGroups/GroupDetail';
import MeetingDetail from '../smallGroups/MeetingDetail';

const DashboardHome = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary-50 rounded-lg p-5 border border-primary-100">
                <p className="text-sm font-medium text-primary-600">Total Members</p>
                <p className="text-3xl font-bold text-primary-900 mt-2">1,248</p>
            </div>
            <div className="bg-green-50 rounded-lg p-5 border border-green-100">
                <p className="text-sm font-medium text-green-600">Weekly Attendance</p>
                <p className="text-3xl font-bold text-green-900 mt-2">856</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-5 border border-purple-100">
                <p className="text-sm font-medium text-purple-600">Active Ministries</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">12</p>
            </div>
        </div>
    </div>
);

export default function DashboardLayout() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    let userName = 'User';
    let churchName = 'Church';
    let userRole = 'Admin';
    let initials = 'U';

    try {
        const decoded: any = jwtDecode(token);
        userName = decoded.userName || 'User';
        churchName = decoded.churchName || 'Church';
        userRole = decoded.roleId || 'Admin';
        initials = userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    } catch (e) {
        console.error('Invalid token');
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Directory', icon: Users, path: '/dashboard/members' },
        { name: 'Announcements', icon: Megaphone, path: '/dashboard/announcements' },
        { name: 'Communications', icon: Mail, path: '/dashboard/communications' },
        { name: 'Small Groups', icon: Users, path: '/dashboard/groups' },
        { name: 'Finance', icon: BadgeDollarSign, path: '/dashboard/finance' },
        { name: 'Events', icon: Calendar, path: '/dashboard/events' },
        { name: 'Attendance', icon: History, path: '/dashboard/attendance' },
        { name: 'Roles & Perms', icon: ShieldCheck, path: '/dashboard/roles' },
        { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex overflow-hidden">

            {/* Sidebar */}
            <aside className={`\${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                    <div className={`font-bold text-primary-600 truncate \${!isSidebarOpen && 'hidden'}`}>
                        {churchName}
                    </div>
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors group ${isActive
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 \${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                <span className={`ml-3 truncate \${!isSidebarOpen && 'hidden'}`}>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="flex items-center w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className={`ml-3 font-medium \${!isSidebarOpen && 'hidden'}`}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
                    <div className="text-xl font-semibold text-gray-800">
                        Administrasi
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 relative rounded-full text-gray-400 hover:bg-gray-100">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                                {initials}
                            </div>
                            <div className="hidden md:block text-sm">
                                <p className="font-medium text-gray-700">{userName}</p>
                                <p className="text-xs text-gray-500">{userRole}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Route Content */}
                <main className="flex-1 overflow-auto p-8 bg-gray-50/50 relative">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/members" element={<MembersDirectory />} />
                        <Route path="/members/:id" element={<MemberProfile />} />
                        <Route path="/announcements" element={<AnnouncementsList />} />
                        <Route path="/communications" element={<CommunicationDashboard />} />
                        <Route path="/finance" element={<FinanceDashboard />} />
                        <Route path="/events" element={<EventDashboard />} />
                        <Route path="/events/:id" element={<EventDetails />} />
                        <Route path="/attendance" element={<AttendanceDashboard />} />
                        <Route path="/attendance/services" element={<ServiceManager />} />
                        <Route path="/attendance/check-in" element={<CheckInPage />} />
                        <Route path="/groups" element={<SmallGroupDashboard />} />
                        <Route path="/groups/:id" element={<GroupDetail />} />
                        <Route path="/groups/:id/meetings/:meetingId" element={<MeetingDetail />} />
                        <Route path="/roles" element={<div className="text-gray-500">RBAC Management functionality goes here</div>} />
                        <Route path="/settings/*" element={<SettingsLayout />} />
                    </Routes>
                </main>
            </div>

        </div>
    );
}
