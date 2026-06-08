import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Mail, Calendar, AlertCircle, Loader2, Trash2, KeyRound } from 'lucide-react';
import api from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { useSubscription } from '../../hooks/useBilling';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  role?: { name: string };
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingUser, setAddingUser] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    setError(null);
    try {
      await api.post('/users', formData);
      setFormData({ name: '', email: '', password: '' });
      fetchUsers();
      alert('User berhasil ditambahkan!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal menambahkan user');
    } finally {
      setAddingUser(false);
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

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-sm text-gray-500">Kelola staf dan administrator gereja Anda.</p>
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
            <div key={user.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{user.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email}</span>
                    <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> {user.role?.name || 'Admin'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Terdaftar</span>
                  <span className="text-xs font-medium">{new Date(user.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex items-center gap-1">
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
                placeholder="********"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />

              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

              <Button type="submit" className="w-full" disabled={addingUser}>
                {addingUser ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Daftarkan User
              </Button>
            </form>
          )}
        </div>
      </div>

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
