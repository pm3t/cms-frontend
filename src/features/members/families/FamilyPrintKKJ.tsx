import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Share2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import api from '../../../lib/axios';
import { resolveFileUrl } from '../../../lib/config';

export default function FamilyPrintKKJ() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [family, setFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/members/families/${id}`)
      .then((res) => {
        setFamily(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Gagal memuat data keluarga');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()}`;
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Menyiapkan Kartu Keluarga Jemaat...</p>
        </div>
      </div>
    );
  }

  if (error || !family) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow max-w-md text-center">
          <p className="text-red-600 font-semibold mb-4">{error || 'Data keluarga tidak ditemukan'}</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali
          </Button>
        </div>
      </div>
    );
  }

  const members: any[] = family.members || [];
  const head = family.headOfFamily || members.find((m) => m.familyRole === 'HEAD');
  const spouses = members.filter((m) => m.familyRole === 'SPOUSE');
  const children = members.filter((m) => m.familyRole === 'CHILD');
  const others = members.filter((m) => m.familyRole === 'OTHER' && m.id !== head?.id);

  const tenant = family.tenant || {};

  return (
    <div className="min-h-screen bg-neutral-200 print:bg-white text-gray-900 py-6 print:py-0 px-2 print:px-0">
      {/* Action Bar (Hidden on print) */}
      <div className="max-w-[297mm] mx-auto mb-4 print:hidden flex items-center justify-between bg-white px-5 py-3 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Detail
          </Button>
          <span className="text-xs text-gray-500 font-medium hidden sm:inline">
            Pratinjau Cetak KKJ: <strong className="text-gray-800">{family.name}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shadow"
          >
            <Printer className="w-4 h-4" /> Cetak Kartu (A4)
          </Button>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 Landscape) */}
      <div
        id="kkj-sheet"
        className="max-w-[297mm] mx-auto bg-white p-8 print:p-0 print:shadow-none shadow-xl border border-gray-300 print:border-none rounded-sm min-h-[200mm] text-[11px] leading-tight font-sans"
        style={{ boxSizing: 'border-box' }}
      >
        {/* TOP HEADER */}
        <div className="flex items-start justify-between border-b-2 border-black pb-3 mb-2">
          {/* Logo & Church Info */}
          <div className="flex items-center gap-3 w-1/3">
            {tenant.logoUrl ? (
              <img
                src={resolveFileUrl(tenant.logoUrl)}
                alt="Logo Gereja"
                className="w-16 h-16 object-contain rounded"
              />
            ) : (
              <div className="w-14 h-14 rounded-full border-2 border-blue-900 flex items-center justify-center font-bold text-blue-900 text-lg bg-blue-50 shrink-0">
                ⛪
              </div>
            )}
            <div>
              <h2 className="text-sm font-extrabold tracking-wide uppercase text-blue-950 font-serif">
                {tenant.name || 'GEREJA EKLESIA'}
              </h2>
              <p className="text-[10px] text-gray-600 leading-snug">
                {tenant.address || 'Alamat Gereja'}
              </p>
              <p className="text-[10px] text-gray-600">
                {tenant.phone ? `Telp: ${tenant.phone}` : ''} {tenant.email ? `• ${tenant.email}` : ''}
              </p>
            </div>
          </div>

          {/* Main Document Title */}
          <div className="w-1/3 text-center self-center">
            <h1 className="text-lg font-black tracking-wider uppercase text-black font-serif">
              KARTU KELUARGA JEMAAT
            </h1>
            <p className="text-[9px] text-gray-500 tracking-widest uppercase font-semibold mt-0.5">
              LEMBAR RESMI KEANGGOTAAN
            </p>
          </div>

          {/* Pasfoto Kepala Rohani (Top Right) */}
          <div className="w-1/3 flex justify-end">
            <div className="w-20 h-24 border-2 border-black bg-neutral-100 flex items-center justify-center overflow-hidden p-0.5 relative shadow-sm">
              {head?.photoUrl ? (
                <img
                  src={resolveFileUrl(head.photoUrl)}
                  alt="Pasfoto Kepala Rohani"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-1">
                  <div className="text-gray-400 text-xs mb-1">👤</div>
                  <span className="text-[8px] font-bold text-gray-400 uppercase leading-none block">
                    FOTO 3x4 KEPALA ROHANI
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GREY BAR INFO */}
        <div className="bg-gray-200 border border-black px-3 py-1 flex items-center justify-between text-[11px] font-bold mb-2">
          <div className="flex gap-1">
            <span className="w-24">Nomor KKJ</span>
            <span>:</span>
            <span className="font-extrabold text-blue-950 ml-1">{family.kkjNumber || '-'}</span>
          </div>
          <div className="flex gap-1">
            <span>Rayon :</span>
            <span className="font-bold ml-1">{family.rayon || '-'}</span>
          </div>
          <div className="flex gap-1">
            <span>Cabang/Ranting :</span>
            <span className="font-bold ml-1">{family.branch || tenant.name || '-'}</span>
          </div>
          <div className="flex gap-1">
            <span>Tanggal Proses :</span>
            <span className="font-bold ml-1">{formatDate(family.processDate)}</span>
          </div>
        </div>

        {/* METADATA IDENTITAS KELUARGA */}
        <div className="grid grid-cols-2 gap-x-6 text-[10.5px] mb-3 px-1">
          {/* Kolom Kiri */}
          <div className="space-y-0.5">
            <div className="flex">
              <span className="w-28 font-semibold">Kepala Rohani</span>
              <span className="w-3">:</span>
              <span className="font-bold uppercase text-black">
                {head ? `${head.firstName} ${head.lastName || ''}` : family.name}
              </span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold">Alamat</span>
              <span className="w-3">:</span>
              <span>{family.address || '-'} {family.rtRw ? `RT/RW ${family.rtRw}` : ''}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold">Kecamatan</span>
              <span className="w-3">:</span>
              <span>{family.district || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold">Kab./Kodya</span>
              <span className="w-3">:</span>
              <span>{family.city || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold">Propinsi</span>
              <span className="w-3">:</span>
              <span>{family.province || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold">Status Pernikahan</span>
              <span className="w-3">:</span>
              <span className="font-semibold">{family.maritalStatus || 'MENIKAH'}</span>
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-0.5">
            <div className="flex">
              <span className="w-28 font-semibold">No. Telepon / HP</span>
              <span className="w-3">:</span>
              <span>{family.phone || head?.phone || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold">Kode Pos</span>
              <span className="w-3">:</span>
              <span>{family.postalCode || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold">Tanggal Pernikahan</span>
              <span className="w-3">:</span>
              <span>{formatDate(family.marriageDate)}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold">Total Anggota</span>
              <span className="w-3">:</span>
              <span className="font-bold">{members.length} Orang</span>
            </div>
          </div>
        </div>

        {/* SECTION A: KEPALA ROHANI */}
        <div className="mb-2">
          <div className="font-bold text-[10px] uppercase text-black mb-0.5">
            A. KEPALA ROHANI
          </div>
          <table className="w-full border-collapse border border-black text-[10px]">
            <thead>
              <tr className="bg-gray-150 border-b border-black">
                <th className="border-r border-black p-1 text-left w-[28%]">Nama</th>
                <th className="border-r border-black p-1 text-left w-[18%]">Tempat Lahir</th>
                <th className="border-r border-black p-1 text-center w-[12%]">Tgl. Lahir</th>
                <th className="border-r border-black p-1 text-center w-[14%]">Pendidikan Terakhir</th>
                <th className="border-r border-black p-1 text-left w-[16%]">Pekerjaan</th>
                <th className="p-1 text-center w-[12%]">Baptis Selam</th>
              </tr>
            </thead>
            <tbody>
              {head ? (
                <tr className="border-b border-black">
                  <td className="border-r border-black p-1 font-bold">
                    {head.firstName} {head.lastName || ''}
                  </td>
                  <td className="border-r border-black p-1">{head.birthPlace || '-'}</td>
                  <td className="border-r border-black p-1 text-center">{formatDate(head.birthDate)}</td>
                  <td className="border-r border-black p-1 text-center">{head.education || '-'}</td>
                  <td className="border-r border-black p-1">{head.occupation || '-'}</td>
                  <td className="p-1 text-center font-medium">
                    {head.isBaptized ? (head.baptizedDate ? formatDate(head.baptizedDate) : 'Ya') : '-'}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={6} className="p-1 text-center text-gray-400 italic">
                    Belum ada Kepala Rohani yang ditetapkan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* SECTION B: PASANGAN */}
        <div className="mb-2">
          <div className="font-bold text-[10px] uppercase text-black mb-0.5">
            B. PASANGAN
          </div>
          <table className="w-full border-collapse border border-black text-[10px]">
            <thead>
              <tr className="bg-gray-150 border-b border-black">
                <th className="border-r border-black p-1 text-left w-[28%]">Nama</th>
                <th className="border-r border-black p-1 text-left w-[18%]">Tempat Lahir</th>
                <th className="border-r border-black p-1 text-center w-[12%]">Tgl. Lahir</th>
                <th className="border-r border-black p-1 text-center w-[14%]">Pendidikan Terakhir</th>
                <th className="border-r border-black p-1 text-left w-[16%]">Pekerjaan</th>
                <th className="p-1 text-center w-[12%]">Baptis Selam</th>
              </tr>
            </thead>
            <tbody>
              {spouses.length > 0 ? (
                spouses.map((s) => (
                  <tr key={s.id} className="border-b border-black">
                    <td className="border-r border-black p-1 font-semibold">
                      {s.firstName} {s.lastName || ''}
                    </td>
                    <td className="border-r border-black p-1">{s.birthPlace || '-'}</td>
                    <td className="border-r border-black p-1 text-center">{formatDate(s.birthDate)}</td>
                    <td className="border-r border-black p-1 text-center">{s.education || '-'}</td>
                    <td className="border-r border-black p-1">{s.occupation || '-'}</td>
                    <td className="p-1 text-center">
                      {s.isBaptized ? (s.baptizedDate ? formatDate(s.baptizedDate) : 'Ya') : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-black h-5">
                  <td className="border-r border-black p-1 text-gray-400 italic text-center" colSpan={6}>-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* SECTION C: ANAK */}
        <div className="mb-2">
          <div className="font-bold text-[10px] uppercase text-black mb-0.5">
            C. ANAK
          </div>
          <table className="w-full border-collapse border border-black text-[10px]">
            <thead>
              <tr className="bg-gray-150 border-b border-black">
                <th className="border-r border-black p-1 text-left w-[22%]">Nama</th>
                <th className="border-r border-black p-1 text-left w-[14%]">Tempat Lahir</th>
                <th className="border-r border-black p-1 text-center w-[10%]">Tgl. Lahir</th>
                <th className="border-r border-black p-1 text-center w-[11%]">Pendidikan Terakhir</th>
                <th className="border-r border-black p-1 text-left w-[13%]">Pekerjaan</th>
                <th className="border-r border-black p-1 text-center w-[6%]">Jenis Kelamin</th>
                <th className="border-r border-black p-1 text-center w-[8%]">Diserahkan</th>
                <th className="border-r border-black p-1 text-center w-[8%]">Baptis Selam</th>
                <th className="p-1 text-center w-[8%]">Nikah</th>
              </tr>
            </thead>
            <tbody>
              {children.length > 0 ? (
                children.map((c) => (
                  <tr key={c.id} className="border-b border-black">
                    <td className="border-r border-black p-1 font-semibold">
                      {c.firstName} {c.lastName || ''}
                    </td>
                    <td className="border-r border-black p-1">{c.birthPlace || '-'}</td>
                    <td className="border-r border-black p-1 text-center">{formatDate(c.birthDate)}</td>
                    <td className="border-r border-black p-1 text-center">{c.education || '-'}</td>
                    <td className="border-r border-black p-1">{c.occupation || '-'}</td>
                    <td className="border-r border-black p-1 text-center font-bold">
                      {c.gender === 'M' ? 'L' : (c.gender === 'F' ? 'P' : '-')}
                    </td>
                    <td className="border-r border-black p-1 text-center">
                      {c.isChildDedicated ? (c.childDedicatedDate ? formatDate(c.childDedicatedDate) : 'Ya') : '-'}
                    </td>
                    <td className="border-r border-black p-1 text-center">
                      {c.isBaptized ? (c.baptizedDate ? formatDate(c.baptizedDate) : 'Ya') : '-'}
                    </td>
                    <td className="p-1 text-center">
                      {c.isMarried ? (c.marriageDate ? formatDate(c.marriageDate) : 'Ya') : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-black h-5">
                  <td className="border-r border-black p-1 text-gray-400 italic text-center" colSpan={9}>-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* SECTION D: LAIN - LAIN (orang lain yang tinggal serumah) */}
        <div className="mb-4">
          <div className="font-bold text-[10px] uppercase text-black mb-0.5">
            D. LAIN - LAIN (orang lain yang tinggal serumah)
          </div>
          <table className="w-full border-collapse border border-black text-[10px]">
            <thead>
              <tr className="bg-gray-150 border-b border-black">
                <th className="border-r border-black p-1 text-left w-[20%]">Nama</th>
                <th className="border-r border-black p-1 text-left w-[13%]">Tempat Lahir</th>
                <th className="border-r border-black p-1 text-center w-[9%]">Tgl. Lahir</th>
                <th className="border-r border-black p-1 text-center w-[10%]">Hubungan</th>
                <th className="border-r border-black p-1 text-center w-[10%]">Pendidikan Terakhir</th>
                <th className="border-r border-black p-1 text-left w-[12%]">Pekerjaan</th>
                <th className="border-r border-black p-1 text-center w-[6%]">Jenis Kelamin</th>
                <th className="border-r border-black p-1 text-center w-[6%]">Diserahkan</th>
                <th className="border-r border-black p-1 text-center w-[7%]">Baptis Selam</th>
                <th className="p-1 text-center w-[7%]">Nikah</th>
              </tr>
            </thead>
            <tbody>
              {others.length > 0 ? (
                others.map((o) => (
                  <tr key={o.id} className="border-b border-black">
                    <td className="border-r border-black p-1 font-semibold">
                      {o.firstName} {o.lastName || ''}
                    </td>
                    <td className="border-r border-black p-1">{o.birthPlace || '-'}</td>
                    <td className="border-r border-black p-1 text-center">{formatDate(o.birthDate)}</td>
                    <td className="border-r border-black p-1 text-center font-medium">{o.familyRelation || 'Famili'}</td>
                    <td className="border-r border-black p-1 text-center">{o.education || '-'}</td>
                    <td className="border-r border-black p-1">{o.occupation || '-'}</td>
                    <td className="border-r border-black p-1 text-center font-bold">
                      {o.gender === 'M' ? 'L' : (o.gender === 'F' ? 'P' : '-')}
                    </td>
                    <td className="border-r border-black p-1 text-center">
                      {o.isChildDedicated ? (o.childDedicatedDate ? formatDate(o.childDedicatedDate) : 'Ya') : '-'}
                    </td>
                    <td className="border-r border-black p-1 text-center">
                      {o.isBaptized ? (o.baptizedDate ? formatDate(o.baptizedDate) : 'Ya') : '-'}
                    </td>
                    <td className="p-1 text-center">
                      {o.isMarried ? (o.marriageDate ? formatDate(o.marriageDate) : 'Ya') : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-black h-5">
                  <td className="border-r border-black p-1 text-gray-400 italic text-center" colSpan={10}>-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* BOTTOM: CATATAN & TANDA TANGAN */}
        <div className="flex items-start justify-between text-[10px] mt-4 pt-2 border-t border-gray-300">
          {/* Notes */}
          <div className="w-[60%] pr-4">
            <span className="font-bold text-black uppercase">CATATAN :</span>
            <ol className="list-decimal list-inside text-gray-700 space-y-0.5 mt-0.5">
              <li>Kartu ini adalah dokumen resmi pendaftaran keluarga jemaat di lingkungan gereja.</li>
              <li>Harap melaporkan ke sekretariat gereja bila ada perubahan anggota keluarga (kelahiran, kepindahan, pernikahan, dsb).</li>
              <li>Kartu ini sah apabila telah ditandatangani oleh Gembala Sidang atau Pejabat Gereja yang berwenang.</li>
            </ol>
            {family.notes && (
              <p className="mt-2 text-gray-600 italic">
                Catatan Khusus: {family.notes}
              </p>
            )}
          </div>

          {/* Signatures */}
          <div className="w-[35%] text-center">
            <p className="text-gray-800">
              {family.citySign || family.city || tenant.city || 'Kota'}, {formatDate(new Date().toISOString())}
            </p>
            <p className="font-bold text-black mt-0.5">Gembala Sidang / Pengurus Gereja,</p>
            <div className="h-16 flex items-center justify-center">
              {/* Space for stamp/signature */}
              <span className="text-gray-300 text-[9px] uppercase tracking-wider">( Tanda Tangan & Stempel )</span>
            </div>
            <p className="font-extrabold text-black uppercase border-b border-black inline-block px-4">
              {family.pastorName || 'Pdt. / Gembala Jemaat'}
            </p>
          </div>
        </div>
      </div>

      {/* Print stylesheet */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #kkj-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

