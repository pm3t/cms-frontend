import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  KeyRound, 
  Edit2, 
  ShieldCheck,
  Check
} from 'lucide-react';
import api from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { useSubscription } from '../../hooks/useBilling';

interface ModuleDefinition {
  key: string;
  name: string;
  description: string;
  category: 'core' | 'operational' | 'pastoral' | 'management';
}

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  roleName?: string;
  permissions?: string[];
  isSuperAdmin?: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [availableModules, setAvailableModules] = useState<ModuleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingUser, setAddingUser] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    roleName: '',
    modules: [] as string[]
  });
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit User & Permissions State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    roleName: '',
    modules: [] as string[],
    password: ''
  });
  const [updatingUser, setUpdatingUser] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Reset & Delete States
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const { data: sub } = useSubscription();

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await api.get('/users/permissions');
      setAvailableModules(response.data);
      // Pre-select all modules for the new user form by default
      setFormData(prev => ({
        ...prev,
        modules: response.data.map((m: ModuleDefinition) => m.key)
      }));
    } catch (err) {
      console.error('Failed to fetch available permissions:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchModules();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    setError(null);
    try {
      await api.post('/users', formData);
      setFormData({ 
        name: '', 
        email: '', 
        password: '',
        roleName: '',
        modules: availableModules.map(m => m.key)
      });
      fetchUsers();
      alert('User berhasil ditambahkan dengan hak akses yang ditentukan!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal menambahkan user');
    } finally {
      setAddingUser(false);
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditError(null);
    setEditFormData({
      name: user.name,
      email: user.email,
      roleName: user.roleName || '',
      modules: user.permissions || availableModules.map(m => m.key),
      password: ''
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdatingUser(true);
    setEditError(null);
    try {
      await api.patch(`/users/${editingUser.id}`, {
        name: editFormData.name,
        email: editFormData.email,
        roleName: editFormData.roleName,
        modules: editFormData.modules,
        ...(editFormData.password ? { password: editFormData.password } : {})
      });
      alert('User dan hak akses modul berhasil diperbarui!');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setEditError(err.response?.data?.error || 'Gagal memperbarui user');
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;

    setDeletingUserId(userId);
    setError(null);
    try {
      await api.delete(`/users/${userId}`);
      alert('User berhasil dihapus!');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal menghapus user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;

    setResettingPassword(true);
    try {
      await api.post(`/users/${resettingUser.id}/reset-password`, { password: newPassword });
      alert('Password berhasil direset!');
      setResettingUser(null);
      setNewPassword('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal mereset password');
    } finally {
      setResettingPassword(false);
    }
  };

  const maxUsers = sub?.plan?.maxUsers || Infinity;
  const isLimitReached = users.length >= maxUsers;

  const renderModuleChecklist = (
    selectedModules: string[],
    onChange: (newModules: string[]) => void
  ) => {
    const toggleModule = (key: string) => {
      if (selectedModules.includes(key)) {
        onChange(selectedModules.filter(k => k !== key));
      } else {
        onChange([...selectedModules, key]);
      }
    };

    const selectAll = () => {
      onChange(availableModules.map(m => m.key));
    };

    const deselectAll = () => {
      onChange([]);
    };

    const categories: { [cat: string]: string } = {
      core: 'Modul Inti',
      operational: 'Operasional & Ibadah',
      pastoral: 'Pastoral & Konseling',
      management: 'Manajemen & Sistem'
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Hak Akses Modul ({selectedModules.length}/{availableModules.length})
          </label>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={selectAll}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Pilih Semua
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={deselectAll}
              className="text-gray-500 hover:text-gray-700"
            >
              Kosongkan
            </button>
          </div>
        </div>

        <div className="max-h-56 overflow-y-auto space-y-3 p-3 border border-gray-200 rounded-lg bg-gray-50/60 divide-y divide-gray-100">
          {Object.entries(categories).map(([catKey, catTitle]) => {
            const catModules = availableModules.filter(m => m.category === catKey);
            if (catModules.length === 0) return null;
            return (
              <div key={catKey} className="pt-2 first:pt-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                  {catTitle}
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {catModules.map(mod => {
                    const isChecked = selectedModules.includes(mod.key);
                    return (
                      <label
                        key={mod.key}
                        className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked ? 'bg-blue-50/80 border border-blue-100' : 'bg-white border border-gray-100 hover:bg-gray-100/70'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleModule(mod.key)}
                          className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-gray-800 block truncate">
                            {mod.name}
                          </span>
                          <span className="text-[11px] text-gray-500 line-clamp-1">
                            {mod.description}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-sm text-gray-500">Kelola staf, administrator, dan hak akses modul per user.</p>
        </div>
        <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">Limit Paket</p>
          <p className="text-sm font-bold text-blue-900">{users.length} / {maxUsers === Infinity ? 'Unlimited' : maxUsers} User</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <div className="lg:col-span-2 space-y-4">
          {users.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((user) => (
            <div key={user.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-sm">{user.name}</h3>
                    {user.isSuperAdmin ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        Super Admin
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {user.roleName || 'Administrator'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1 truncate"><Mail className="h-3 w-3" /> {user.email}</span>
                  </div>

                  {/* Module Badges */}
                  <div className="pt-1 flex flex-wrap gap-1 items-center">
                    {user.isSuperAdmin || (user.permissions && availableModules.length > 0 && user.permissions.length === availableModules.length) ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Akses Penuh (Semua Modul)
                      </span>
                    ) : (
                      <>
                        {(user.permissions || []).slice(0, 3).map(pKey => {
                          const mod = availableModules.find(m => m.key === pKey);
                          return (
                            <span key={pKey} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                              {mod?.name || pKey}
                            </span>
                          );
                        })}
                        {(user.permissions || []).length > 3 && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                            +{(user.permissions?.length || 0) - 3} modul lainnya
                          </span>
                        )}
                        {(user.permissions || []).length === 0 && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                            Tidak ada akses modul
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Terdaftar</span>
                  <span className="text-xs font-medium">{new Date(user.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(user)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit User & Hak Akses"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setResettingUser(user)}
                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Reset Password"
                  >
                    <KeyRound className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={deletingUserId === user.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Hapus User"
                  >
                    {deletingUserId === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <Pagination 
            currentPage={currentPage}
            totalPages={Math.ceil(users.length / pageSize)}
            onPageChange={setCurrentPage}
            totalRecords={users.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        </div>

        {/* Add User Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit sticky top-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Tambah User Baru
          </h3>

          {isLimitReached ? (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Limit paket tercapai!</strong> Paket {sub?.plan?.name} Anda hanya mengizinkan maksimal {maxUsers} user admin.
                </p>
              </div>
              <a href="/billing/upgrade" className="w-full block text-center bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors">
                Upgrade Paket Sekarang
              </a>
            </div>
          ) : (
            <form onSubmit={handleAddUser} className="space-y-4">
              <Input 
                label="Nama Lengkap" 
                placeholder="Contoh: Budi Santoso"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input 
                label="Email" 
                type="email"
                placeholder="budi@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input 
                label="Password" 
                type="password"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Input 
                label="Jabatan / Peran (Opsional)" 
                placeholder="Contoh: Bendahara, Sekretariat, dsb."
                value={formData.roleName}
                onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
              />

              {/* Module Checklist */}
              {renderModuleChecklist(formData.modules, (newMods) => setFormData({ ...formData, modules: newMods }))}

              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

              <Button type="submit" className="w-full" disabled={addingUser}>
                {addingUser ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Daftarkan User
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Edit User & Permissions Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-blue-600" />
                Edit User & Hak Akses Modul
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Atur informasi profil dan centang modul yang boleh diakses oleh user ini.
              </p>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <Input
                label="Nama Lengkap"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                required
              />
              <Input
                label="Jabatan / Nama Peran"
                placeholder="Contoh: Staff Keuangan, Divisi Multimedia"
                value={editFormData.roleName}
                onChange={(e) => setEditFormData({ ...editFormData, roleName: e.target.value })}
              />
              <Input
                label="Ganti Password (Kosongkan jika tidak ingin diubah)"
                type="password"
                placeholder="••••••••"
                value={editFormData.password}
                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
              />

              {/* Module Checklist */}
              {renderModuleChecklist(editFormData.modules, (newMods) => setEditFormData({ ...editFormData, modules: newMods }))}

              {editError && <p className="text-xs text-red-600 font-medium">{editError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                  disabled={updatingUser}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={updatingUser}
                  isLoading={updatingUser}
                >
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-amber-500" />
                Reset Password User
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Masukkan kata sandi baru untuk <strong>{resettingUser.name}</strong> ({resettingUser.email}).
              </p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                label="Password Baru"
                type="password"
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setResettingUser(null);
                    setNewPassword('');
                  }}
                  disabled={resettingPassword}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={resettingPassword}
                  isLoading={resettingPassword}
                  className="bg-amber-600 hover:bg-amber-700 text-white border-none"
                >
                  Simpan Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
