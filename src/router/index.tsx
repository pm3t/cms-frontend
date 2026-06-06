import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import SuperAdminRoute from '../components/auth/SuperAdminRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import SuperAdminLayout from '../layouts/SuperAdminLayout';

// Auth Pages
const Login = lazy(() => import('../features/auth/Login'));
const Register = lazy(() => import('../features/auth/Register'));

// Billing Pages
const BillingPage = lazy(() => import('../pages/billing/BillingPage'));
const UpgradePlanPage = lazy(() => import('../pages/billing/UpgradePlanPage'));
const InvoiceListPage = lazy(() => import('../pages/billing/InvoiceListPage'));
const InvoiceDetailPage = lazy(() => import('../pages/billing/InvoiceDetailPage'));
const PaymentSuccessPage = lazy(() => import('../pages/billing/PaymentSuccessPage'));
const PaymentFailedPage = lazy(() => import('../pages/billing/PaymentFailedPage'));

// Super Admin Pages
const TenantListPage = lazy(() => import('../pages/super-admin/TenantListPage'));
const SuperAdminUsersPage = lazy(() => import('../pages/super-admin/SuperAdminUsersPage'));
const SuperAdminSettingsPage = lazy(() => import('../pages/super-admin/SuperAdminSettingsPage'));

// Dashboard
const DashboardHome = lazy(() => import('../features/dashboard/DashboardHome'));

// --- REAL FEATURE MODULES ---
const MembersDirectory = lazy(() => import('../features/members/MembersDirectory'));
const MemberProfile = lazy(() => import('../features/members/MemberProfile'));
const SmallGroupDashboard = lazy(() => import('../features/smallGroups/SmallGroupDashboard'));
const AttendanceDashboard = lazy(() => import('../features/attendance/AttendanceDashboard'));
const EventDashboard = lazy(() => import('../features/events/EventDashboard'));
const CommunicationDashboard = lazy(() => import('../features/communication/CommunicationDashboard'));
const FinanceDashboard = lazy(() => import('../features/finance/FinanceDashboard'));
const UserManagementPage = lazy(() => import('../pages/users/UserManagementPage'));
const MinistryDashboard = lazy(() => import('../features/ministry/MinistryDashboard'));
const DonationPortal = lazy(() => import('../features/finance/DonationPortal'));
const EventDetails = lazy(() => import('../features/events/EventDetails'));
const PublicRegistration = lazy(() => import('../features/events/PublicRegistration'));
const GroupDetail = lazy(() => import('../features/smallGroups/GroupDetail'));
const MeetingDetail = lazy(() => import('../features/smallGroups/MeetingDetail'));
const ServiceManager = lazy(() => import('../features/attendance/ServiceManager'));
const CheckInPage = lazy(() => import('../features/attendance/CheckInPage'));
const PastoralDashboard = lazy(() => import('../features/pastoral/PastoralDashboard'));
const DocumentDashboard = lazy(() => import('../features/documents/DocumentDashboard'));
const FacilityDashboard = lazy(() => import('../features/facility/FacilityDashboard'));
const ReportingDashboard = lazy(() => import('../features/reporting/ReportingDashboard'));
const DigitalDashboard = lazy(() => import('../features/digital/DigitalDashboard'));
const SettingsLayout = lazy(() => import('../features/settings/SettingsLayout'));
// --- END REAL FEATURE MODULES ---

// Placeholder components for remaining routes
// DashboardHome is now a lazy-loaded component defined above
const SettingsPlaceholder = () => <div className="p-4 bg-white rounded-lg shadow">Pengaturan Gereja (Coming Soon)</div>;

const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/give/:churchId" element={<DonationPortal />} />
        <Route path="/register-event/:id" element={<PublicRegistration />} />
        
        {/* Protected Dashboard (Church Admin) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardHome />} />
            
            {/* Real Feature Routes */}
            <Route path="/members" element={<MembersDirectory />} />
            <Route path="/members/:id" element={<MemberProfile />} />
            <Route path="/small-groups" element={<SmallGroupDashboard />} />
            <Route path="/small-groups/:id" element={<GroupDetail />} />
            <Route path="/small-groups/:id/meetings/:meetingId" element={<MeetingDetail />} />
            <Route path="/attendance" element={<AttendanceDashboard />} />
            <Route path="/attendance/services" element={<ServiceManager />} />
            <Route path="/attendance/check-in" element={<CheckInPage />} />
            <Route path="/events" element={<EventDashboard />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/communication" element={<CommunicationDashboard />} />
            <Route path="/finance" element={<FinanceDashboard />} />
            <Route path="/ministry" element={<MinistryDashboard />} />
            <Route path="/pastoral" element={<PastoralDashboard />} />
            <Route path="/documents" element={<DocumentDashboard />} />
            <Route path="/facility" element={<FacilityDashboard />} />
            <Route path="/reports" element={<ReportingDashboard />} />
            <Route path="/digital" element={<DigitalDashboard />} />
            
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/settings" element={<SettingsLayout />} />
            
            {/* Billing Routes */}
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/billing/upgrade" element={<UpgradePlanPage />} />
            <Route path="/billing/invoices" element={<InvoiceListPage />} />
            <Route path="/billing/invoices/:id" element={<InvoiceDetailPage />} />
          </Route>
        </Route>

        {/* Payment Result Routes */}
        <Route path="/billing/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/billing/payment/failed" element={<PaymentFailedPage />} />

        {/* Super Admin Routes */}
        <Route element={<SuperAdminRoute />}>
          <Route element={<SuperAdminLayout />}>
            <Route path="/super-admin/dashboard" element={<div className="p-4 bg-white rounded-lg shadow">Super Admin Overview</div>} />
            <Route path="/super-admin/tenants" element={<TenantListPage />} />
            <Route path="/super-admin/users" element={<SuperAdminUsersPage />} />
            <Route path="/super-admin/settings" element={<SuperAdminSettingsPage />} />
          </Route>
        </Route>

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
