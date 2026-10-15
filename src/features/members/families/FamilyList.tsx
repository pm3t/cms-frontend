import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Printer,
  Search,
  Building2,
  MapPin,
  Trash2,
  Edit3,
  ExternalLink,
  Home,
  FileText,
  UserCheck,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import FamilyFormModal from './FamilyFormModal';
import api from '../../../lib/axios';
import { resolveFileUrl } from '../../../lib/config';

export default function FamilyList() {
  const navigate = useNavigate();
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchFamilies = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get('/members/families/all', {
        params: query ? { search: query } : {},
      });
      setFamilies(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch families', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFamilies(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDeleteFamily = async (id: string, name: string) => {
    if (!confirm(`Hapus data ${name}? Seluruh anggota keluarga akan dilepaskan (profil jemaat tidak dihapus).`)) {
      return;
    }
    try {
      await api.delete(`/members/families/${id}`);
      await fetchFamilies(search);
    } catch (err: any) {
      alert('Gagal menghapus keluarga: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return '-';
    }
  };

  // Metrics
  const totalFamilies = families.length;
  const totalMembers = families.reduce((acc, f) => acc + (f._count?.members || f.members?.length || 0), 0);
  const familiesWithHead = families.filter((f) => !!f.headOfFamily).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Manajemen Keluarga & KKJ
              </h1>
              <p className="text-sm text-gray-500">
                Pencatatan Kartu Keluarga Jemaat (KKJ), relasi keluarga, dan pencetakan kartu resmi
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> Buat Kartu Keluarga Baru
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Kartu Keluarga (KKJ)</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{totalFamilies}</h3>
            <p className="text-xs text-blue-600 font-medium mt-0.5">Keluarga terdaftar</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Jiwa Terdaftar</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{totalMembers}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">
              Rata-rata {totalFamilies ? (totalMembers / totalFamilies).toFixed(1) : 0} jiwa/KKJ
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kepala Rohani Terverifikasi</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{familiesWithHead}</h3>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">
              {totalFamilies ? Math.round((familiesWithHead / totalFamilies) * 100) : 0}% kelengkapan data
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama keluarga, No. KKJ, atau kepala rohani..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="text-xs text-gray-500 font-medium self-end sm:self-center">
          Menampilkan {families.length} kartu keluarga
        </div>
      </div>

      {/* Families Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Memuat data keluarga...</p>
          </div>
        ) : families.length === 0 ? (
          <div className="p-12 text-center">
            <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">Belum ada Kartu Keluarga Jemaat (KKJ)</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Mulai daftarkan data keluarga jemaat untuk mempermudah tata kelola penggembalaan dan pencetakan kartu keluarga resmi.
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              <UserPlus className="w-4 h-4 mr-1.5" /> Buat KKJ Sekarang
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-bold text-gray-500 uppercase">
                  <th className="p-4 w-40">Nomor KKJ</th>
                  <th className="p-4">Nama Keluarga</th>
                  <th className="p-4">Kepala Rohani</th>
                  <th className="p-4 text-center">Jumlah Anggota</th>
                  <th className="p-4">Wilayah / Rayon</th>
                  <th className="p-4">Tanggal Proses</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {families.map((fam) => {
                  const memberCount = fam._count?.members ?? fam.members?.length ?? 0;
                  const head = fam.headOfFamily;
                  return (
                    <tr key={fam.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-blue-900 text-xs">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200/80">
                          {fam.kkjNumber || '-'}
                        </span>
                      </td>

                      <td className="p-4">
                        <Link
                          to={`/members/families/${fam.id}`}
                          className="font-bold text-gray-900 hover:text-blue-600 transition-colors block text-base"
                        >
                          {fam.name}
                        </Link>
                        {fam.address && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
                            {fam.address}
                          </p>
                        )}
                      </td>

                      <td className="p-4">
                        {head ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                              {head.photoUrl ? (
                                <img
                                  src={resolveFileUrl(head.photoUrl)}
                                  alt={head.firstName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                head.firstName.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-xs">
                                {head.firstName} {head.lastName || ''}
                              </p>
                              {head.phone && (
                                <p className="text-[11px] text-gray-400">{head.phone}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Belum diatur</span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-gray-100 text-gray-800">
                          <Users className="w-3.5 h-3.5 text-gray-500" />
                          {memberCount} Jiwa
                        </span>
                      </td>

                      <td className="p-4 text-xs text-gray-600">
                        <div className="font-medium text-gray-800">
                          {fam.rayon ? `Rayon: ${fam.rayon}` : '-'}
                        </div>
                        <div className="text-gray-400">{fam.city || '-'}</div>
                      </td>

                      <td className="p-4 text-xs text-gray-600">
                        {formatDate(fam.processDate || fam.createdAt)}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/members/families/${fam.id}/print`)}
                            className="bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-xs flex items-center gap-1 font-semibold"
                            title="Cetak KKJ"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Cetak</span>
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => navigate(`/members/families/${fam.id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Kelola</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteFamily(fam.id, fam.name)}
                            className="text-red-500 hover:bg-red-50 hover:border-red-200"
                            title="Hapus KKJ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Buat Keluarga Baru */}
      <FamilyFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newFam) => {
          fetchFamilies(search);
          navigate(`/members/families/${newFam.id}`);
        }}
      />
    </div>
  );
}

