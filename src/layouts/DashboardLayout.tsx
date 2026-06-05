import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  Church,
  Calendar,
  Layers,
  Megaphone,
  MessageSquare,
  PieChart,
  UserCheck,
  Users2,
  Sparkles,
  CalendarCheck,
  ScanLine,
  HeartHandshake,
  FolderOpen,
  Building2,
  BarChartIcon,
  Radio
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useSubscription } from '../hooks/useBilling';
import SubscriptionStatusBanner from '../components/billing/SubscriptionStatusBanner';
import PlanBadge from '../components/billing/PlanBadge';

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  
  // Initialize and sync subscription data
  useSubscription();
  
  const subStatus = useSubscriptionStore((state) => state.status);
  const plan = useSubscriptionStore((state) => state.plan);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Anggota', href: '/members', icon: Users },
    { name: 'Kelompok Kecil', href: '/small-groups', icon: Users2 },
    { name: 'Absensi', href: '/attendance', icon: UserCheck },
    { name: 'Jadwal Ibadah', href: '/attendance/services', icon: CalendarCheck },
    { name: 'Check-in Jemaat', href: '/attendance/check-in', icon: ScanLine },
    { name: 'Acara', href: '/events', icon: Calendar },
    { name: 'Komunikasi', href: '/communication', icon: MessageSquare },
    { name: 'Keuangan', href: '/finance', icon: PieChart },
    { name: 'Pelayanan', href: '/ministry', icon: Sparkles },
    { name: 'Pastoral Care', href: '/pastoral', icon: HeartHandshake },
    { name: 'Dokumen', href: '/documents', icon: FolderOpen },
    { name: 'Fasilitas', href: '/facility', icon: Building2 },
    { name: 'Laporan', href: '/reports', icon: BarChartIcon },
    { name: 'Digital', href: '/digital', icon: Radio },
  ];

  const billingNav = [
    { name: 'Manajemen User', href: '/users', icon: Users },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Invoice', href: '/billing/invoices', icon: FileText },
    { name: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Global Status Banner */}
      {subStatus && <SubscriptionStatusBanner status={subStatus} />}

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col">
            {/* Logo */}
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
              <Church className="h-8 w-8 text-blue-600" />
              <span className="ml-3 text-xl font-bold text-gray-900 truncate">Eklesia</span>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pelayanan</p>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}

              <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-6 mb-2">Administrasi</p>
              {billingNav.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Section: Tenant Info & Plan */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Organisasi</p>
                <p className="text-sm font-bold text-gray-900 truncate">{user?.organization_id}</p>
                {plan && <div className="mt-1"><PlanBadge planName={plan?.name} /></div>}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Keluar
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 flex justify-end items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {user?.name?.[0]}
              </div>
            </div>
          </header>

          {/* Content Wrapper */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
