import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Mail, Calendar, AlertCircle, Loader2 } from 'lucide-react';
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
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Terdaftar</span>
                <span className="text-xs font-medium">{new Date(user.createdAt).toLocaleDateString('id-ID')}</span>
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
    </div>
  );
}
