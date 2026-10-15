import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Edit3,
  UserPlus,
  Trash2,
  Users,
  Building2,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2,
  Shield,
  Home,
  UserX,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import FamilyFormModal from './FamilyFormModal';
import FamilyMemberModal from './FamilyMemberModal';
import api from '../../../lib/axios';
import { resolveFileUrl } from '../../../lib/config';

export default function FamilyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [family, setFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isEditFamilyOpen, setIsEditFamilyOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<any>(null);

  const fetchFamily = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/members/families/${id}`);
      setFamily(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal mengambil data keluarga');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();
  }, [id]);

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Keluarkan ${memberName} dari kartu keluarga ini? Data profil jemaat tidak akan terhapus.`)) {
      return;
    }
    try {
      await api.delete(`/members/families/${id}/members/${memberId}`);
      await fetchFamily();
    } catch (err: any) {
      alert('Gagal mengeluarkan anggota: ' + (err.response?.data?.error || err.message));
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

  const calculateAge = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      const today = new Date();
      let age = today.getFullYear() - d.getFullYear();
      const m = today.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
      return age >= 0 ? `${age} thn` : null;
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Memuat detail keluarga...</p>
        </div>
      </div>
    );
  }

  if (error || !family) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-4">
          {error || 'Data keluarga tidak ditemukan'}
        </div>
        <Button variant="outline" onClick={() => navigate('/members/families')}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Daftar Keluarga
        </Button>
      </div>
    );
  }

  const members: any[] = family.members || [];
  const head = family.headOfFamily || members.find((m) => m.familyRole === 'HEAD');
  const spouses = members.filter((m) => m.familyRole === 'SPOUSE');
  const children = members.filter((m) => m.familyRole === 'CHILD');
  const others = members.filter((m) => m.familyRole === 'OTHER' && m.id !== head?.id);

  const renderMemberRow = (m: any, defaultHubungan: string) => {
    const age = calculateAge(m.birthDate);
    return (
      <tr key={m.id} className="hover:bg-blue-50/40 transition-colors border-b border-gray-100">
        <td className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center overflow-hidden shrink-0 border border-blue-200">
              {m.photoUrl ? (
                <img src={resolveFileUrl(m.photoUrl)} alt={m.firstName} className="w-full h-full object-cover" />
              ) : (
                <span>{m.firstName.charAt(0)}</span>
              )}
            </div>
            <div>
              <Link
                to={`/members/${m.id}`}
                className="font-bold text-gray-900 hover:text-blue-600 flex items-center gap-1 group"
              >
                <span>{m.firstName} {m.lastName || ''}</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                <span className="font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                  {m.familyRelation || defaultHubungan}
                </span>
                <span>•</span>
                <span>{m.gender === 'M' ? 'Laki-laki' : (m.gender === 'F' ? 'Perempuan' : '-')}</span>
              </div>
            </div>
          </div>
        </td>
        <td className="p-3 text-sm text-gray-700">
          <div>{m.birthPlace || '-'}</div>
          <div className="text-xs text-gray-500 font-medium">
            {formatDate(m.birthDate)} {age && `(${age})`}
          </div>
        </td>
        <td className="p-3 text-sm text-gray-700">
          <div>{m.education || '-'}</div>
          <div className="text-xs text-gray-500">{m.occupation || '-'}</div>
        </td>
        <td className="p-3">
          <div className="space-y-1 text-xs">
            {m.isBaptized && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Baptis Selam {m.baptizedDate && `(${formatDate(m.baptizedDate)})`}
              </span>
            )}
            {m.isChildDedicated && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium border border-purple-200">
                <CheckCircle2 className="w-3 h-3 text-purple-600" />
                Diserahkan
              </span>
            )}
            {m.isMarried && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 font-medium border border-pink-200">
                <CheckCircle2 className="w-3 h-3 text-pink-600" />
                Nikah
              </span>
            )}
            {!m.isBaptized && !m.isChildDedicated && !m.isMarried && (
              <span className="text-gray-400 text-xs italic">-</span>
            )}
          </div>
        </td>
        <td className="p-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMemberToEdit(m);
                setIsMemberModalOpen(true);
              }}
              title="Edit Data Anggota"
            >
              <Edit3 className="w-3.5 h-3.5 text-gray-600" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRemoveMember(m.id, `${m.firstName} ${m.lastName || ''}`)}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              title="Keluarkan dari Kartu Keluarga"
            >
              <UserX className="w-3.5 h-3.5 text-red-500" />
            </Button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/members/families')}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Keluarga
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{family.name}</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-extrabold rounded-full border border-blue-200">
              No. KKJ: {family.kkjNumber || 'Belum diatur'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditFamilyOpen(true)}
            className="flex items-center gap-1.5 text-gray-700"
          >
            <Edit3 className="w-4 h-4" /> Edit Data KKJ
          </Button>

          <Button
            onClick={() => navigate(`/members/families/${family.id}/print`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 font-semibold shadow-sm"
          >
            <Printer className="w-4 h-4" /> Cetak Kartu Keluarga (KKJ)
          </Button>

          <Button
            onClick={() => {
              setMemberToEdit(null);
              setIsMemberModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 font-semibold shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> Tambah Anggota
          </Button>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kepala Rohani Highlight */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 rounded-xl border border-blue-100 flex items-center gap-4">
            <div className="w-20 h-24 rounded-lg bg-white border-2 border-blue-300 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              {head?.photoUrl ? (
                <img
                  src={resolveFileUrl(head.photoUrl)}
                  alt="Pasfoto Kepala Rohani"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2">
                  <span className="text-2xl">👤</span>
                  <span className="block text-[9px] text-gray-400 font-bold uppercase mt-1 leading-tight">
                    Foto KKJ
                  </span>
                </div>
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-0.5">
                Kepala Rohani / Keluarga
              </span>
              <h3 className="text-base font-black text-gray-900 leading-snug">
                {head ? `${head.firstName} ${head.lastName || ''}` : '-'}
              </h3>
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {family.phone || head?.phone || 'Tidak ada no telepon'}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-blue-600 text-white">
                  {members.length} Anggota Keluarga
                </span>
              </div>
            </div>
          </div>

          {/* Domisili & Wilayah */}
          <div className="space-y-2 text-sm text-gray-700">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> Domisili & Wilayah
            </h4>
            <div className="text-xs space-y-1">
              <p className="font-semibold text-gray-900">
                {family.address || 'Alamat belum diisi'} {family.rtRw && `(RT/RW ${family.rtRw})`}
              </p>
              <p className="text-gray-600">
                Kec. {family.district || '-'}, {family.city || '-'}, {family.province || '-'} {family.postalCode}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                <span className="bg-gray-100 px-2 py-0.5 rounded font-medium text-gray-700">
                  Rayon: <strong className="text-gray-900">{family.rayon || '-'}</strong>
                </span>
                <span className="bg-gray-100 px-2 py-0.5 rounded font-medium text-gray-700">
                  Cabang: <strong className="text-gray-900">{family.branch || '-'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Legalitas & Tanggal */}
          <div className="space-y-2 text-sm text-gray-700">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> Data Pernikahan & Proses
            </h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Status Pernikahan:</span>
                <span className="font-bold text-gray-800">{family.maritalStatus || 'MENIKAH'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tanggal Pernikahan:</span>
                <span className="font-semibold text-gray-800">{formatDate(family.marriageDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tanggal Proses KKJ:</span>
                <span className="font-semibold text-gray-800">{formatDate(family.processDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Penandatangan KKJ:</span>
                <span className="font-semibold text-gray-800">{family.pastorName || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {family.notes && (
          <div className="px-6 py-2.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
            <span className="font-bold text-gray-700">Catatan:</span> {family.notes}
          </div>
        )}
      </div>

      {/* ANGGOTA KELUARGA SECTION (Grouped as per KKJ standard) */}
      <div className="space-y-6">
        {/* SECTION A: KEPALA ROHANI */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                A
              </span>
              <h3 className="font-extrabold text-sm text-gray-900 tracking-wide uppercase">
                KEPALA ROHANI / KEPALA KELUARGA
              </h3>
            </div>
            {!head && (
              <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                Belum ditentukan
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase">
                  <th className="p-3 w-1/3">Nama Lengkap</th>
                  <th className="p-3 w-1/4">Tempat & Tanggal Lahir</th>
                  <th className="p-3 w-1/4">Pendidikan & Pekerjaan</th>
                  <th className="p-3 w-1/6">Status Rohani</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {head ? (
                  renderMemberRow(head, 'Kepala Keluarga')
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-400 text-sm">
                      Belum ada anggota yang ditetapkan sebagai Kepala Rohani.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION B: PASANGAN */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                B
              </span>
              <h3 className="font-extrabold text-sm text-gray-900 tracking-wide uppercase">
                PASANGAN (ISTRI / SUAMI)
              </h3>
              <span className="text-xs text-gray-500 font-semibold">({spouses.length})</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase">
                  <th className="p-3 w-1/3">Nama Lengkap</th>
                  <th className="p-3 w-1/4">Tempat & Tanggal Lahir</th>
                  <th className="p-3 w-1/4">Pendidikan & Pekerjaan</th>
                  <th className="p-3 w-1/6">Status Rohani</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {spouses.length > 0 ? (
                  spouses.map((s) => renderMemberRow(s, 'Pasangan'))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-400 text-sm italic">
                      Tidak ada data pasangan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION C: ANAK */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                C
              </span>
              <h3 className="font-extrabold text-sm text-gray-900 tracking-wide uppercase">
                ANAK
              </h3>
              <span className="text-xs text-gray-500 font-semibold">({children.length})</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase">
                  <th className="p-3 w-1/3">Nama Lengkap</th>
                  <th className="p-3 w-1/4">Tempat & Tanggal Lahir</th>
                  <th className="p-3 w-1/4">Pendidikan & Pekerjaan</th>
                  <th className="p-3 w-1/6">Status Rohani</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {children.length > 0 ? (
                  children.map((c) => renderMemberRow(c, 'Anak'))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-400 text-sm italic">
                      Tidak ada data anak yang terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION D: LAIN - LAIN */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-black flex items-center justify-center">
                D
              </span>
              <h3 className="font-extrabold text-sm text-gray-900 tracking-wide uppercase">
                LAIN - LAIN (ORANG LAIN YANG TINGGAL SERUMAH)
              </h3>
              <span className="text-xs text-gray-500 font-semibold">({others.length})</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase">
                  <th className="p-3 w-1/3">Nama Lengkap</th>
                  <th className="p-3 w-1/4">Tempat & Tanggal Lahir</th>
                  <th className="p-3 w-1/4">Pendidikan & Pekerjaan</th>
                  <th className="p-3 w-1/6">Status Rohani</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {others.length > 0 ? (
                  others.map((o) => renderMemberRow(o, 'Famili / Lainnya'))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-400 text-sm italic">
                      Tidak ada anggota lain yang tinggal serumah.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FamilyFormModal
        isOpen={isEditFamilyOpen}
        onClose={() => setIsEditFamilyOpen(false)}
        onSuccess={() => fetchFamily()}
        family={family}
      />

      <FamilyMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setMemberToEdit(null);
        }}
        onSuccess={() => fetchFamily()}
        familyId={family.id}
        memberToEdit={memberToEdit}
      />
    </div>
  );
}

