import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Calendar,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react';
import { 
  useTenants, 
  useUpdateTenantStatus, 
  useBulkDeleteTenants,
  useSuperAdminPlans,
  useUpdateTenantPlan 
} from '../../hooks/useSuperAdmin';
import PlanBadge from '../../components/billing/PlanBadge';

const TenantListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const { data: tenants, isLoading } = useTenants();
  const { data: plans } = useSuperAdminPlans();
  const updateStatusMutation = useUpdateTenantStatus();
  const bulkDeleteMutation = useBulkDeleteTenants();
  const updatePlanMutation = useUpdateTenantPlan();

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const action = currentStatus === 'suspended' ? 'activate' : 'suspend';
    const confirmMsg = action === 'suspend' 
      ? 'Apakah Anda yakin ingin menangguhkan tenant ini? Akses dashboard mereka akan diblokir.'
      : 'Aktifkan kembali akses tenant ini?';

    if (window.confirm(confirmMsg)) {
      try {
        await updateStatusMutation.mutateAsync({ id, action });
      } catch (err) {
        alert('Gagal memperbarui status: ' + (err as Error).message);
      }
    }
  };

  const handlePlanChange = async (id: string, planId: string) => {
    if (window.confirm('Apakah Anda yakin ingin mengubah paket tenant ini secara langsung tanpa melibatkan invoice/Xendit?')) {
      try {
        await updatePlanMutation.mutateAsync({ id, planId });
        alert('Paket tenant berhasil diperbarui.');
      } catch (err) {
        alert('Gagal memperbarui paket: ' + (err as Error).message);
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && filteredTenants) {
      setSelectedIds(filteredTenants.map((t: any) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    const confirmMsg = `Apakah Anda yakin ingin menghapus ${selectedIds.length} tenant secara permanen? Seluruh data anggota, user, dan invoice terkait akan ikut terhapus dan TIDAK bisa dikembalikan.`;
    
    if (window.confirm(confirmMsg)) {
      try {
        await bulkDeleteMutation.mutateAsync(selectedIds);
        setSelectedIds([]);
        alert('Tenant berhasil dihapus masal.');
      } catch (err) {
        alert('Gagal menghapus masal: ' + (err as Error).message);
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center">Memuat data tenant...</div>;

  const filteredTenants = tenants?.filter((t: any) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const latestSub = t.subscriptions?.[0];
    const matchesStatus = statusFilter === 'all' || latestSub?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Tenant (Gereja)</h1>
          <p className="text-gray-500 text-sm">Monitor dan kelola semua organisasi gereja yang menggunakan platform.</p>
        </div>
        
        {selectedIds.length > 0 && (
          <button 
            onClick={handleBulkDelete}
            disabled={bulkDeleteMutation.isPending}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition shadow-lg shadow-red-100"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Hapus ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari gereja atau ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Past Due</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedIds.length === filteredTenants?.length && filteredTenants?.length > 0}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Gereja</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Paket & Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statistik</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tgl. Daftar</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTenants?.map((tenant: any) => {
                const latestSub = tenant.subscriptions?.[0];
                const isSelected = selectedIds.includes(tenant.id);
                return (
                  <tr key={tenant.id} className={`hover:bg-gray-50 transition ${isSelected ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleSelectOne(tenant.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{tenant.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">ID: {tenant.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <select
                          value={latestSub?.planId || plans?.find((p: any) => p.name === 'Free')?.id || ''}
                          onChange={(e) => handlePlanChange(tenant.id, e.target.value)}
                          disabled={updatePlanMutation.isPending}
                          className="text-xs font-semibold px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 max-w-[130px]"
                        >
                          {plans?.map((plan: any) => (
                            <option key={plan.id} value={plan.id}>
                              {plan.name}
                            </option>
                          ))}
                        </select>
                        <span className={`text-[10px] font-black uppercase tracking-wider 
                          ${latestSub?.status === 'active' || latestSub?.status === 'trialing' ? 'text-green-600' : 
                            latestSub?.status === 'suspended' ? 'text-red-600' : 'text-amber-600'}
                        `}>
                          {latestSub?.status || 'No Subscription'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1"><Users className="h-3 w-3" /> {tenant._count.members} Anggota</div>
                        <div className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> {tenant._count.users} User</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(tenant.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleToggleStatus(tenant.id, latestSub?.status)}
                        disabled={updateStatusMutation.isPending}
                        className={`p-2 rounded-lg transition-colors ${
                          latestSub?.status === 'suspended' 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                        title={latestSub?.status === 'suspended' ? 'Aktifkan' : 'Tangguhkan'}
                      >
                        {latestSub?.status === 'suspended' ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTenants?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                    Tidak ada tenant yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TenantListPage;
