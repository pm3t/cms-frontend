import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import SearchableMemberSelect from '../../../components/ui/SearchableMemberSelect';
import api from '../../../lib/axios';

interface FamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedFamily: any) => void;
  familyId: string;
  memberToEdit?: any; // If editing
}

export default function FamilyMemberModal({
  isOpen,
  onClose,
  onSuccess,
  familyId,
  memberToEdit,
}: FamilyMemberModalProps) {
  const isEditing = !!memberToEdit;
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');

  // Existing member selection
  const [existingMembers, setExistingMembers] = useState<any[]>([]);
  const [selectedExistingMemberId, setSelectedExistingMemberId] = useState('');

  // Form Data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'M',
    birthPlace: '',
    birthDate: '',
    familyRole: 'CHILD',
    familyRelation: '',
    education: '',
    occupation: '',
    phone: '',
    email: '',
    isBaptized: false,
    baptizedDate: '',
    isChildDedicated: false,
    childDedicatedDate: '',
    isMarried: false,
    marriageDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    // Fetch existing members not in this family
    api.get('/members')
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : (res.data.members || []);
        setExistingMembers(all);
      })
      .catch((err) => console.error(err));

    if (memberToEdit) {
      setFormData({
        firstName: memberToEdit.firstName || '',
        lastName: memberToEdit.lastName || '',
        gender: memberToEdit.gender || 'M',
        birthPlace: memberToEdit.birthPlace || '',
        birthDate: memberToEdit.birthDate ? memberToEdit.birthDate.split('T')[0] : '',
        familyRole: memberToEdit.familyRole || 'CHILD',
        familyRelation: memberToEdit.familyRelation || '',
        education: memberToEdit.education || '',
        occupation: memberToEdit.occupation || '',
        phone: memberToEdit.phone || '',
        email: memberToEdit.email || '',
        isBaptized: !!memberToEdit.isBaptized,
        baptizedDate: memberToEdit.baptizedDate ? memberToEdit.baptizedDate.split('T')[0] : '',
        isChildDedicated: !!memberToEdit.isChildDedicated,
        childDedicatedDate: memberToEdit.childDedicatedDate ? memberToEdit.childDedicatedDate.split('T')[0] : '',
        isMarried: !!memberToEdit.isMarried,
        marriageDate: memberToEdit.marriageDate ? memberToEdit.marriageDate.split('T')[0] : '',
      });
    } else {
      setActiveTab('existing');
      setSelectedExistingMemberId('');
      setFormData({
        firstName: '',
        lastName: '',
        gender: 'M',
        birthPlace: '',
        birthDate: '',
        familyRole: 'CHILD',
        familyRelation: '',
        education: '',
        occupation: '',
        phone: '',
        email: '',
        isBaptized: false,
        baptizedDate: '',
        isChildDedicated: false,
        childDedicatedDate: '',
        isMarried: false,
        marriageDate: '',
      });
    }
  }, [isOpen, memberToEdit]);

  // When existing member is selected, auto-fill fields
  useEffect(() => {
    if (activeTab === 'existing' && selectedExistingMemberId) {
      const found = existingMembers.find((m) => m.id === selectedExistingMemberId);
      if (found) {
        setFormData((prev) => ({
          ...prev,
          firstName: found.firstName || '',
          lastName: found.lastName || '',
          gender: found.gender || 'M',
          birthPlace: found.birthPlace || '',
          birthDate: found.birthDate ? found.birthDate.split('T')[0] : '',
          education: found.education || '',
          occupation: found.occupation || '',
          isBaptized: found.isBaptized !== undefined ? found.isBaptized : (found.sacraments?.some((s: any) => s.type === 'BAPTISM') ?? false),
          baptizedDate: found.baptizedDate ? found.baptizedDate.split('T')[0] : '',
          isChildDedicated: !!found.isChildDedicated,
          childDedicatedDate: found.childDedicatedDate ? found.childDedicatedDate.split('T')[0] : '',
          isMarried: !!found.isMarried,
          marriageDate: found.marriageDate ? found.marriageDate.split('T')[0] : '',
          phone: found.phone || '',
          email: found.email || '',
        }));
      }
    }
  }, [selectedExistingMemberId, activeTab, existingMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        ...formData,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
        baptizedDate: formData.isBaptized && formData.baptizedDate ? new Date(formData.baptizedDate).toISOString() : null,
        childDedicatedDate: formData.isChildDedicated && formData.childDedicatedDate ? new Date(formData.childDedicatedDate).toISOString() : null,
        marriageDate: formData.isMarried && formData.marriageDate ? new Date(formData.marriageDate).toISOString() : null,
      };

      let res;
      if (isEditing) {
        res = await api.patch(`/members/families/${familyId}/members/${memberToEdit.id}`, payload);
      } else {
        if (activeTab === 'existing') {
          if (!selectedExistingMemberId) {
            setError('Silakan pilih data jemaat terlebih dahulu');
            setLoading(false);
            return;
          }
          res = await api.post(`/members/families/${familyId}/members`, {
            ...payload,
            existingMemberId: selectedExistingMemberId,
          });
        } else {
          res = await api.post(`/members/families/${familyId}/members`, payload);
        }
      }

      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Gagal menyimpan anggota keluarga');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-200" />
            <div>
              <h3 className="text-lg font-bold">
                {isEditing ? 'Edit Data Anggota Keluarga' : 'Tambah Anggota Keluarga'}
              </h3>
              <p className="text-xs text-blue-100">
                Atur peran dalam KKJ (Kepala Rohani, Pasangan, Anak, atau Lain-lain)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection if creating */}
        {!isEditing && (
          <div className="flex border-b border-gray-200 bg-gray-50/70 px-6 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab('existing')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'existing'
                  ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pilih dari Jemaat Terdaftar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'new'
                  ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              + Input Jemaat / Anggota Baru
            </button>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Select existing member picker */}
          {!isEditing && activeTab === 'existing' && (
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200">
              <label className="block text-sm font-bold text-blue-900 mb-1.5">
                Cari Jemaat yang Akan Ditambahkan ke KKJ <span className="text-red-500">*</span>
              </label>
              <SearchableMemberSelect
                members={existingMembers}
                value={selectedExistingMemberId}
                onChange={(val) => setSelectedExistingMemberId(val)}
                placeholder="-- Ketik nama jemaat untuk mencari --"
                required
              />
              <p className="text-xs text-blue-700 mt-1.5">
                Data nama, tanggal lahir, dan status akan otomatis diisi dari profil jemaat yang dipilih.
              </p>
            </div>
          )}

          {/* Role and Relation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Kedudukan / Peran dalam KKJ <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.familyRole}
                onChange={(e) => {
                  const role = e.target.value;
                  setFormData({
                    ...formData,
                    familyRole: role,
                    familyRelation: role === 'OTHER' ? (formData.familyRelation || 'Famili') : '',
                  });
                }}
              >
                <option value="HEAD">A. KEPALA ROHANI / KEPALA KELUARGA</option>
                <option value="SPOUSE">B. PASANGAN (Istri / Suami)</option>
                <option value="CHILD">C. ANAK</option>
                <option value="OTHER">D. LAIN-LAIN (Tinggal Serumah)</option>
              </select>
            </div>

            {formData.familyRole === 'OTHER' ? (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Hubungan Keluarga (Kolom Hubungan) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Orang Tua, Mertua, Keponakan, Famili"
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.familyRelation}
                  onChange={(e) => setFormData({ ...formData, familyRelation: e.target.value })}
                />
              </div>
            ) : (
              <div className="flex items-center text-xs text-gray-500 pt-6">
                <span>Peran ini akan otomatis masuk ke tabel {formData.familyRole} di lembar KKJ.</span>
              </div>
            )}
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nama Depan <span className="text-red-500">*</span>
              </label>
              <Input
                required
                placeholder="Nama Depan"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nama Belakang / Marga
              </label>
              <Input
                placeholder="Nama Belakang / Marga"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="M">Laki-laki (L)</option>
                <option value="F">Perempuan (P)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tempat Lahir
              </label>
              <Input
                placeholder="Contoh: Jakarta / Bandung"
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tanggal Lahir
              </label>
              <Input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pendidikan Terakhir
              </label>
              <Input
                placeholder="Contoh: SMA / S1 / S2 / SD"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pekerjaan
              </label>
              <Input
                placeholder="Contoh: Karyawan Swasta, Wiraswasta, PNS, Pelajar, Ibu Rumah Tangga"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              />
            </div>
          </div>

          {/* Spiritual & Sacrament Checkmarks */}
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-150 space-y-3">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Status Rohani & Sakramen di KKJ
            </h4>

            {/* Baptis Selam */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  checked={formData.isBaptized}
                  onChange={(e) => setFormData({ ...formData, isBaptized: e.target.checked })}
                />
                Sudah Baptis Selam
              </label>
              {formData.isBaptized && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Tgl:</span>
                  <input
                    type="date"
                    className="h-8 px-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                    value={formData.baptizedDate}
                    onChange={(e) => setFormData({ ...formData, baptizedDate: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Diserahkan (Penyerahan Anak) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  checked={formData.isChildDedicated}
                  onChange={(e) => setFormData({ ...formData, isChildDedicated: e.target.checked })}
                />
                Sudah Diserahkan (Penyerahan Anak)
              </label>
              {formData.isChildDedicated && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Tgl:</span>
                  <input
                    type="date"
                    className="h-8 px-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                    value={formData.childDedicatedDate}
                    onChange={(e) => setFormData({ ...formData, childDedicatedDate: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Nikah */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  checked={formData.isMarried}
                  onChange={(e) => setFormData({ ...formData, isMarried: e.target.checked })}
                />
                Sudah Menikah (Pemberkatan Nikah)
              </label>
              {formData.isMarried && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Tgl:</span>
                  <input
                    type="date"
                    className="h-8 px-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                    value={formData.marriageDate}
                    onChange={(e) => setFormData({ ...formData, marriageDate: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambahkan ke KKJ')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

