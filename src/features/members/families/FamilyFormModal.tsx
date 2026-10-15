import React, { useState, useEffect } from 'react';
import { X, Wand2, Building2, MapPin, Phone, Calendar, UserCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import api from '../../../lib/axios';

interface FamilyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (family: any) => void;
  family?: any; // If editing
}

export default function FamilyFormModal({
  isOpen,
  onClose,
  onSuccess,
  family,
}: FamilyFormModalProps) {
  const isEditing = !!family;

  const [formData, setFormData] = useState({
    name: '',
    kkjNumber: '',
    headOfFamilyId: '',
    address: '',
    rtRw: '',
    district: '',
    city: '',
    province: '',
    postalCode: '',
    rayon: '',
    branch: '',
    phone: '',
    maritalStatus: 'MENIKAH',
    marriageDate: '',
    processDate: new Date().toISOString().split('T')[0],
    pastorName: '',
    citySign: '',
    notes: '',
  });

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingKkj, setGeneratingKkj] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch members for head of family select
    api.get('/members')
      .then((res) => {
        setMembers(Array.isArray(res.data) ? res.data : (res.data.members || []));
      })
      .catch((err) => console.error('Failed to load members', err));

    if (family) {
      setFormData({
        name: family.name || '',
        kkjNumber: family.kkjNumber || '',
        headOfFamilyId: family.headOfFamilyId || '',
        address: family.address || '',
        rtRw: family.rtRw || '',
        district: family.district || '',
        city: family.city || '',
        province: family.province || '',
        postalCode: family.postalCode || '',
        rayon: family.rayon || '',
        branch: family.branch || '',
        phone: family.phone || '',
        maritalStatus: family.maritalStatus || 'MENIKAH',
        marriageDate: family.marriageDate ? family.marriageDate.split('T')[0] : '',
        processDate: family.processDate ? family.processDate.split('T')[0] : new Date().toISOString().split('T')[0],
        pastorName: family.pastorName || '',
        citySign: family.citySign || '',
        notes: family.notes || '',
      });
    } else {
      // Auto generate KKJ for new family if empty
      handleGenerateKkj();
    }
  }, [isOpen, family]);

  const handleGenerateKkj = async () => {
    setGeneratingKkj(true);
    try {
      const res = await api.get('/members/families/generate-kkj');
      if (res.data.kkjNumber) {
        setFormData((prev) => ({ ...prev, kkjNumber: res.data.kkjNumber }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingKkj(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        ...formData,
        headOfFamilyId: formData.headOfFamilyId || null,
        marriageDate: formData.marriageDate ? new Date(formData.marriageDate).toISOString() : null,
        processDate: formData.processDate ? new Date(formData.processDate).toISOString() : new Date().toISOString(),
      };

      let res;
      if (isEditing) {
        res = await api.patch(`/members/families/${family.id}`, payload);
      } else {
        res = await api.post('/members/families/create', payload);
      }

      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Gagal menyimpan data keluarga');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">
              {isEditing ? 'Edit Data Kartu Keluarga Jemaat (KKJ)' : 'Buat Kartu Keluarga Jemaat (KKJ) Baru'}
            </h3>
            <p className="text-xs text-blue-100 mt-0.5">
              Lengkapi informasi kepala rohani, nomor KKJ, dan domisili keluarga
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nama Keluarga <span className="text-red-500">*</span>
              </label>
              <Input
                required
                placeholder="Contoh: Keluarga Bpk. Budi Santoso"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nomor KKJ (Kartu Keluarga Jemaat) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  required
                  placeholder="Contoh: KKJ-2024-0001"
                  value={formData.kkjNumber}
                  onChange={(e) => setFormData({ ...formData, kkjNumber: e.target.value })}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateKkj}
                  disabled={generatingKkj}
                  title="Generate otomatis nomor KKJ baru"
                >
                  <Wand2 className="w-4 h-4 mr-1 text-blue-600" />
                  Auto
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Kepala Rohani / Keluarga
              </label>
              <select
                className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.headOfFamilyId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedMem = members.find((m) => m.id === selectedId);
                  setFormData((prev) => ({
                    ...prev,
                    headOfFamilyId: selectedId,
                    // If address is empty and member has address, auto-fill
                    address: prev.address || selectedMem?.address || '',
                    district: prev.district || selectedMem?.district || '',
                    city: prev.city || selectedMem?.city || '',
                    postalCode: prev.postalCode || selectedMem?.postalCode || '',
                    rayon: prev.rayon || selectedMem?.rayon || '',
                    phone: prev.phone || selectedMem?.phone || '',
                  }));
                }}
              >
                <option value="">-- Pilih dari Jemaat Terdaftar --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName || ''} ({m.category || 'Jemaat'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Rayon / Sektor Wilayah
              </label>
              <Input
                placeholder="Contoh: Rayon 1 / Wilayah Barat"
                value={formData.rayon}
                onChange={(e) => setFormData({ ...formData, rayon: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Cabang / Ranting Gereja
              </label>
              <Input
                placeholder="Contoh: Gedung Pusat / Sariwangi"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tanggal Proses KKJ
              </label>
              <Input
                type="date"
                value={formData.processDate}
                onChange={(e) => setFormData({ ...formData, processDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                No. Telepon / HP Keluarga
              </label>
              <Input
                placeholder="Contoh: 08123456789"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Domisili & Alamat */}
          <div className="pt-3 border-t border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> Alamat & Domisili Keluarga
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Alamat Lengkap</label>
                <Input
                  placeholder="Nama Jalan, Blok, No Rumah"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">RT / RW</label>
                <Input
                  placeholder="Contoh: 003 / 005"
                  value={formData.rtRw}
                  onChange={(e) => setFormData({ ...formData, rtRw: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kecamatan</label>
                <Input
                  placeholder="Contoh: Sukasari"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kabupaten / Kota</label>
                <Input
                  placeholder="Contoh: Kota Bandung"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Provinsi</label>
                <Input
                  placeholder="Contoh: Jawa Barat"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kode Pos</label>
                <Input
                  placeholder="Contoh: 40152"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status Pernikahan</label>
                <select
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                >
                  <option value="MENIKAH">MENIKAH</option>
                  <option value="LAJANG">LAJANG / SINGLE</option>
                  <option value="DUDA/JANDA">DUDA / JANDA</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Pernikahan</label>
                <Input
                  type="date"
                  value={formData.marriageDate}
                  onChange={(e) => setFormData({ ...formData, marriageDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Pengesahan & Catatan */}
          <div className="pt-3 border-t border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Pengesahan KKJ (Untuk Cetak Kartu)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Gembala / Pejabat Penandatangan</label>
                <Input
                  placeholder="Contoh: Pdt. Dr. John Doe, M.Th."
                  value={formData.pastorName}
                  onChange={(e) => setFormData({ ...formData, pastorName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kota Penandatanganan</label>
                <Input
                  placeholder="Contoh: Bandung, Jakarta, Bengkulu"
                  value={formData.citySign}
                  onChange={(e) => setFormData({ ...formData, citySign: e.target.value })}
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Catatan khusus kartu keluarga..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Buat Kartu Keluarga')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

