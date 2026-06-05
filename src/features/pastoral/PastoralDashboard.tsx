import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Flame, 
  Users2, 
  AlertOctagon, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Heart, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Clock, 
  X,
  MapPin,
  FileText,
  Pencil,
  ChevronDown
} from 'lucide-react';
import api from '../../lib/axios';
import { pastoralService } from './pastoralService';

import type { 
  PastoralVisitation, 
  CounselingRecord, 
  PrayerRequest, 
  CareGroup, 
  CrisisRecord, 
  EmergencyContact 
} from './pastoralService';

type TabId = 'VISITATIONS' | 'COUNSELING' | 'PRAYERS' | 'CARE_GROUPS' | 'CRISIS';

export default function PastoralDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('VISITATIONS');
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Core Module States
  const [visitations, setVisitations] = useState<PastoralVisitation[]>([]);
  const [counselings, setCounselings] = useState<CounselingRecord[]>([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [careGroups, setCareGroups] = useState<CareGroup[]>([]);
  const [crises, setCrises] = useState<CrisisRecord[]>([]);

  // Modals / Form toggles
  const [activeModal, setActiveModal] = useState<string | null>(null); // 'VISIT' | 'COUNSEL' | 'PRAY' | 'GROUP' | 'CRISIS' | 'EMERGENCY'
  const [editingVisitation, setEditingVisitation] = useState<PastoralVisitation | null>(null);
  const [editingCounseling, setEditingCounseling] = useState<CounselingRecord | null>(null);
  
  // Search Filters
  const [memberQuery, setMemberQuery] = useState('');
  
  // Dropdown helper states
  const [selectedMemberId, setSelectedMemberId] = useState('');


  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, vRes, cRes, pRes, cgRes, crRes] = await Promise.all([
        api.get('/members'),
        pastoralService.getVisitations(),
        pastoralService.getCounselings().catch(() => []), // gracefully handle privacy restriction errors
        pastoralService.getPrayers(),
        pastoralService.getCareGroups(),
        pastoralService.getCrises()
      ]);
      
      setMembers(mRes.data || []);
      setVisitations(vRes || []);
      setCounselings(cRes || []);
      setPrayers(pRes || []);
      setCareGroups(cgRes || []);
      setCrises(crRes || []);
    } catch (err) {
      console.error('Error fetching pastoral data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Premium Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <HeartHandshake className="w-8 h-8 text-blue-200 animate-pulse" />
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Pastoral Care & Administration</h1>
            </div>
            <p className="mt-2 text-blue-100 text-sm md:text-base max-w-2xl">
              Kelola pelayanan jemaat, kunjungan, bimbingan konseling rahasia, sistem pokok doa, pendampingan kelompok kasih, serta penanganan krisis darurat.
            </p>
          </div>
          <button 
            onClick={() => fetchData()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white font-semibold text-sm rounded-xl backdrop-blur-md border border-white/20 flex items-center gap-2"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Modern Dashboard Navigation Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar bg-white rounded-t-2xl px-4 shadow-sm border border-gray-100">
        {[
          { id: 'VISITATIONS', name: 'Kunjungan (Visitations)', icon: HeartHandshake, color: 'text-rose-500' },
          { id: 'COUNSELING', name: 'Konseling (Counseling)', icon: ShieldCheck, color: 'text-indigo-500' },
          { id: 'PRAYERS', name: 'Pokok Doa (Prayer requests)', icon: Flame, color: 'text-amber-500' },
          { id: 'CARE_GROUPS', name: 'Kelompok Kasih (Care Groups)', icon: Users2, color: 'text-blue-500' },
          { id: 'CRISIS', name: 'Krisis & Kontak Darurat', icon: AlertOctagon, color: 'text-red-500' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`flex items-center gap-2.5 px-6 py-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-600 translate-y-[1px]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : tab.color}`} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Main Tab Area */}
      <div className="bg-white p-6 rounded-b-2xl shadow-sm border border-t-0 border-gray-100 min-h-[500px]">
        {loading ? (
          <div className="h-96 w-full flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm font-medium">Memuat Modul Pastoral Care...</p>
          </div>
        ) : (
          <>
            {activeTab === 'VISITATIONS' && (
              <VisitationsView 
                visitations={visitations} 
                members={members} 
                onRefresh={fetchData} 
                onOpenModal={() => {
                  setEditingVisitation(null);
                  setActiveModal('VISIT');
                }} 
                onEdit={(visit) => {
                  setEditingVisitation(visit);
                  setActiveModal('VISIT');
                }}
              />
            )}
            {activeTab === 'COUNSELING' && (
              <CounselingView 
                counselings={counselings} 
                members={members} 
                onRefresh={fetchData} 
                onOpenModal={() => {
                  setEditingCounseling(null);
                  setActiveModal('COUNSEL');
                }} 
                onEdit={(counsel) => {
                  setEditingCounseling(counsel);
                  setActiveModal('COUNSEL');
                }}
              />
            )}
            {activeTab === 'PRAYERS' && (
              <PrayersView 
                prayers={prayers} 
                members={members} 
                onRefresh={fetchData} 
                onOpenModal={() => setActiveModal('PRAY')} 
              />
            )}
            {activeTab === 'CARE_GROUPS' && (
              <CareGroupsView 
                careGroups={careGroups} 
                members={members} 
                onRefresh={fetchData} 
                onOpenModal={() => setActiveModal('GROUP')} 
              />
            )}
            {activeTab === 'CRISIS' && (
              <CrisisView 
                crises={crises} 
                members={members} 
                onRefresh={fetchData} 
                onOpenModal={() => setActiveModal('CRISIS')} 
              />
            )}
          </>
        )}
      </div>

      {/* Add Modal Forms */}
      {activeModal && (
        <ModalOverlay onClose={() => {
          setActiveModal(null);
          setEditingVisitation(null);
          setEditingCounseling(null);
        }}>
          {activeModal === 'VISIT' && (
            <VisitationForm 
              members={members} 
              onClose={() => {
                setActiveModal(null);
                setEditingVisitation(null);
              }} 
              onRefresh={fetchData} 
              initialData={editingVisitation}
            />
          )}
          {activeModal === 'COUNSEL' && (
            <CounselingForm 
              members={members} 
              onClose={() => {
                setActiveModal(null);
                setEditingCounseling(null);
              }} 
              onRefresh={fetchData} 
              initialData={editingCounseling}
            />
          )}
          {activeModal === 'PRAY' && (
            <PrayerForm 
              members={members} 
              onClose={() => setActiveModal(null)} 
              onRefresh={fetchData} 
            />
          )}
          {activeModal === 'GROUP' && (
            <CareGroupForm 
              onClose={() => setActiveModal(null)} 
              onRefresh={fetchData} 
            />
          )}
          {activeModal === 'CRISIS' && (
            <CrisisForm 
              members={members} 
              onClose={() => setActiveModal(null)} 
              onRefresh={fetchData} 
            />
          )}
        </ModalOverlay>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTS
// ==========================================

interface SearchableMemberSelectProps {
  members: any[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

function SearchableMemberSelect({ members, value, onChange, placeholder = "-- Pilih Jemaat --", required = false }: SearchableMemberSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedMember = useMemo(() => {
    return members.find(m => m.id === value);
  }, [members, value]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(m => {
      const fullName = `${m.firstName} ${m.lastName || ''}`.toLowerCase();
      const category = (m.category || '').toLowerCase();
      return fullName.includes(query) || category.includes(query);
    });
  }, [members, searchQuery]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery('');
        }}
        className="w-full bg-white border border-gray-250 hover:border-gray-400 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none flex justify-between items-center text-left transition-all"
      >
        <span className={selectedMember ? "text-gray-900" : "text-gray-400"}>
          {selectedMember 
            ? `${selectedMember.firstName} ${selectedMember.lastName || ''} (${selectedMember.category || 'Jemaat'})` 
            : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Hidden input to support form validation */}
      <input 
        type="text" 
        value={value} 
        onChange={() => {}} 
        required={required} 
        className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
      />

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-150 flex items-center gap-2 bg-gray-50/50">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari nama atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm focus:outline-none border-none p-1"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
            {filteredMembers.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">Tidak ada jemaat ditemukan</div>
            ) : (
              filteredMembers.map((m) => {
                const isSelected = m.id === value;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onChange(m.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors flex justify-between items-center ${
                      isSelected ? 'bg-blue-50/50 text-blue-600 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <span>{m.firstName} {m.lastName || ''} <span className="text-xs text-gray-400 font-normal">({m.category || 'Jemaat'})</span></span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SUB-VIEWS
// ==========================================

// 1. Visitations View
interface VisitationsViewProps {
  visitations: PastoralVisitation[];
  members: any[];
  onRefresh: () => void;
  onOpenModal: () => void;
  onEdit: (visit: PastoralVisitation) => void;
}

function VisitationsView({ visitations, members, onRefresh, onOpenModal, onEdit }: VisitationsViewProps) {
  const handleStatusChange = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PLANNED' ? 'COMPLETED' : currentStatus === 'COMPLETED' ? 'CANCELLED' : 'PLANNED';
    try {
      await pastoralService.updateVisitation(id, { status: nextStatus });
      onRefresh();
    } catch (err) {
      alert('Gagal mengupdate status: ' + err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan kunjungan ini?')) return;
    try {
      await pastoralService.deleteVisitation(id);
      onRefresh();
    } catch (err) {
      alert('Gagal menghapus: ' + err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manajemen Kunjungan Jemaat</h2>
          <p className="text-sm text-gray-500">Catat dan pantau jadwal kunjungan rumah, rumah sakit, dan pendampingan jemaat.</p>
        </div>
        <button 
          onClick={onOpenModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-blue-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Kunjungan Baru
        </button>
      </div>

      {visitations.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-500">
          <HeartHandshake className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-semibold text-lg text-gray-700 mb-1">Belum Ada Riwayat Kunjungan</p>
          <p className="text-sm mb-4">Catat kunjungan pelayanan jemaat Anda hari ini untuk memantau keadaan mereka.</p>
          <button 
            onClick={onOpenModal}
            className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-sm rounded-xl inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Catat Pertama Kali
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visitations.map((visit) => {
            const dateStr = new Date(visit.visitDate).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });

            return (
              <div 
                key={visit.id} 
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-rose-100 transition-all duration-300 flex flex-col justify-between relative group"
              >
                <div>
                  {/* Card Badge Header */}
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase ${
                      visit.type === 'HOSPITAL' 
                        ? 'bg-red-50 text-red-600' 
                        : visit.type === 'HOME' 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-purple-50 text-purple-600'
                    }`}>
                      {visit.type === 'HOSPITAL' ? '🏥 R. SAKIT' : visit.type === 'HOME' ? '🏠 RUMAH' : '📍 LAINNYA'}
                    </span>

                    <button 
                      onClick={() => handleStatusChange(visit.id!, visit.status)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                        visit.status === 'COMPLETED' 
                          ? 'bg-blue-50 text-blue-600' 
                          : visit.status === 'PLANNED' 
                            ? 'bg-amber-50 text-amber-600' 
                            : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {visit.status === 'COMPLETED' ? '✓ SELESAI' : visit.status === 'PLANNED' ? '⌛ RENCANA' : '✕ BATAL'}
                    </button>
                  </div>

                  {/* Body Content */}
                  <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                    {visit.member ? `${visit.member.firstName} ${visit.member.lastName || ''}` : 'Jemaat'}
                  </h3>
                  
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Dilayani oleh: <strong className="text-gray-800">{visit.visitorName}</strong></span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tujuan / Keluhan</p>
                    <p className="text-sm font-semibold text-gray-700">{visit.purpose}</p>
                  </div>

                  {visit.notes && (
                    <div className="mt-3 bg-gray-50 p-3 rounded-xl">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Catatan Pelayanan</p>
                      <p className="text-sm text-gray-600 line-clamp-3">{visit.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button 
                    onClick={() => onEdit(visit)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                    title="Edit Kunjungan"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(visit.id!)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                    title="Hapus Kunjungan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 2. Counseling View
interface CounselingViewProps {
  counselings: CounselingRecord[];
  members: any[];
  onRefresh: () => void;
  onOpenModal: () => void;
  onEdit: (counsel: CounselingRecord) => void;
}

function CounselingView({ counselings, members, onRefresh, onOpenModal, onEdit }: CounselingViewProps) {
  const [visibleNotes, setVisibleNotes] = useState<Record<string, boolean>>({});

  const toggleNotesVisibility = (id: string) => {
    setVisibleNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan konseling ini? Data rekam medis rohani ini akan hilang selamanya.')) return;
    try {
      await pastoralService.deleteCounseling(id);
      onRefresh();
    } catch (err) {
      alert('Gagal menghapus: ' + err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Rekam Konseling Rahasia</h2>
          <p className="text-sm text-gray-500">Simpan dan catat konseling jemaat secara privat dengan jaminan hak kerahasiaan tinggi.</p>
        </div>
        <button 
          onClick={onOpenModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-indigo-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Sesi Konseling Baru
        </button>
      </div>

      {/* Security notice card */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-extrabold text-indigo-950 text-sm md:text-base">Informasi Rahasia & Keamanan Privasi</h4>
          <p className="text-xs md:text-sm text-indigo-800 mt-1 max-w-4xl">
            Modul konseling dirancang sesuai batasan etika pastoral. Seluruh data berlabel **Privat** diisolasi dan hanya dapat diakses oleh Pastor, Administrator, dan Konselor terkait. Pengguna jemaat umum atau staf biasa tanpa otoritas penuh tidak dapat mencari atau melihat detail isi percakapan konseling ini.
          </p>
        </div>
      </div>

      {counselings.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-500">
          <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-semibold text-lg text-gray-700 mb-1">Belum Ada Sesi Konseling Tercatat</p>
          <p className="text-sm mb-4">Mulai pencatatan konseling secara tertutup untuk memberikan konseling rohani yang terstruktur.</p>
          <button 
            onClick={onOpenModal}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-sm rounded-xl inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Buat Rekam Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {counselings.map((counsel) => {
            const showNotes = visibleNotes[counsel.id!] || false;
            const dateStr = new Date(counsel.counselingDate).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div 
                key={counsel.id} 
                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:border-indigo-100 transition-all duration-300"
              >
                {/* Header */}
                <div className="bg-gray-50/70 px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900">
                        {counsel.member ? `${counsel.member.firstName} ${counsel.member.lastName || ''}` : 'Konseli'}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium">Konseli Jemaat</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 ${
                      counsel.isPrivate 
                        ? 'bg-rose-50 text-rose-600' 
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      <Lock className="w-3.5 h-3.5" />
                      {counsel.isPrivate ? 'PRIVAT & RAHASIA' : 'UMUM / TERBUKA'}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">{dateStr}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wider">Topik Konseling</h4>
                    <p className="text-lg font-extrabold text-indigo-950 mt-1">{counsel.title}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-1.5">Deskripsi Masalah / Pokok Doa</h5>
                      <p className="text-sm font-semibold text-gray-700 leading-relaxed bg-gray-50/30 p-3 rounded-xl border border-gray-50">
                        {counsel.issueDescription}
                      </p>
                    </div>
                    {counsel.actionPlan && (
                      <div>
                        <h5 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-1.5">Rencana Tindak Lanjut / Solusi</h5>
                        <p className="text-sm font-semibold text-gray-600 leading-relaxed bg-gray-50/30 p-3 rounded-xl border border-gray-50">
                          {counsel.actionPlan}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confidential Session Notes Panel */}
                  <div className="border border-indigo-100/50 rounded-2xl bg-indigo-50/20 overflow-hidden">
                    <div className="bg-indigo-50/40 px-4 py-3 flex justify-between items-center border-b border-indigo-50">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">Catatan Sesi (Sangat Rahasia)</span>
                      </div>
                      <button 
                        onClick={() => toggleNotesVisibility(counsel.id!)}
                        className="px-3 py-1 bg-white hover:bg-indigo-100 text-indigo-600 border border-indigo-200 hover:border-indigo-300 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {showNotes ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showNotes ? 'Sembunyikan' : 'Buka Catatan'}
                      </button>
                    </div>

                    <div className="p-4">
                      {showNotes ? (
                        <p className="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {counsel.notes}
                        </p>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-gray-400">
                          <Lock className="w-8 h-8 mb-2 text-indigo-300" />
                          <p className="text-xs font-semibold text-indigo-800">Catatan terkunci untuk privasi. Klik "Buka Catatan" untuk membaca percakapan sesi konseling.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-bold">Konselor: <strong className="text-indigo-650 font-bold">{counsel.counselorName}</strong></span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onEdit(counsel)}
                        className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                        title="Edit Rekam Konseling"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(counsel.id!)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="Hapus Rekam Konseling"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 3. Prayers View
interface PrayersViewProps {
  prayers: PrayerRequest[];
  members: any[];
  onRefresh: () => void;
  onOpenModal: () => void;
}

function PrayersView({ prayers, members, onRefresh, onOpenModal }: PrayersViewProps) {
  const [prayingId, setPrayingId] = useState<string | null>(null);

  const handlePrayClick = async (id: string) => {
    setPrayingId(id);
    try {
      await pastoralService.incrementPray(id);
      onRefresh();
      setTimeout(() => setPrayingId(null), 1000);
    } catch (err) {
      alert('Gagal mendata: ' + err);
      setPrayingId(null);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PENDING' ? 'ACTIVE' : currentStatus === 'ACTIVE' ? 'ANSWERED' : 'PENDING';
    try {
      await pastoralService.updatePrayer(id, { status: nextStatus });
      onRefresh();
    } catch (err) {
      alert('Gagal update status: ' + err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus permohonan doa ini?')) return;
    try {
      await pastoralService.deletePrayer(id);
      onRefresh();
    } catch (err) {
      alert('Gagal menghapus: ' + err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Sistem Pokok Doa (Prayer Requests)</h2>
          <p className="text-sm text-gray-500">Dukung jemaat dalam doa syafaat. Catat permohonan doa syafaat serta kesaksian jawaban doa mereka.</p>
        </div>
        <button 
          onClick={onOpenModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 transition-all text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-amber-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Kirim Pokok Doa
        </button>
      </div>

      {prayers.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-500">
          <Flame className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-semibold text-lg text-gray-700 mb-1">Belum Ada Permohonan Doa</p>
          <p className="text-sm mb-4">Pastikan jemaat didukung penuh dalam permohonan syafaat mereka dengan menginput kebutuhan doa mereka.</p>
          <button 
            onClick={onOpenModal}
            className="px-4 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 font-bold text-sm rounded-xl inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Buat Pokok Doa Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prayers.map((pray) => {
            const dateStr = new Date(pray.createdAt || '').toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });

            return (
              <div 
                key={pray.id} 
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-amber-100 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Badges Header */}
                  <div className="flex justify-between items-center gap-2 mb-4">
                    <div className="flex gap-1.5">
                      {pray.isAnonymous && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-600 rounded">
                          ANONIM
                        </span>
                      )}
                      {pray.isPrivate && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-600 rounded flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> PRIVAT
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleStatusChange(pray.id!, pray.status)}
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-lg cursor-pointer ${
                        pray.status === 'ANSWERED'
                          ? 'bg-green-50 text-green-600'
                          : pray.status === 'ACTIVE'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {pray.status === 'ANSWERED' ? '✨ TERJAWAB' : pray.status === 'ACTIVE' ? '🔥 BERDOA' : '⌛ ANTRIAN'}
                    </button>
                  </div>

                  <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    {pray.isAnonymous ? 'Jemaat Anonim' : pray.requesterName}
                  </h3>
                  
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">Dikirim pada: {dateStr}</p>

                  <div className="mt-4 bg-gray-50/50 p-4 rounded-xl border border-gray-50">
                    <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                      "{pray.content}"
                    </p>
                  </div>

                  {pray.notes && (
                    <div className="mt-3 bg-green-50/30 p-3 rounded-xl border border-green-50">
                      <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Kesaksian / Jawaban Doa</p>
                      <p className="text-sm text-gray-700 font-medium">{pray.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePrayClick(pray.id!)}
                      disabled={prayingId === pray.id}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer ${
                        prayingId === pray.id 
                          ? 'bg-amber-500 text-white border-amber-500 scale-95' 
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${prayingId === pray.id ? 'fill-current animate-ping' : ''}`} />
                      <span>{prayingId === pray.id ? 'Berdoa...' : 'Saya Berdoa'}</span>
                    </button>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50/50 px-2 py-1 rounded-lg">
                      {pray.prayerCount || 0} Dukungan Doa
                    </span>
                  </div>

                  <button 
                    onClick={() => handleDelete(pray.id!)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                    title="Hapus Permohonan Doa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 4. Care Groups View
interface CareGroupsViewProps {
  careGroups: CareGroup[];
  members: any[];
  onRefresh: () => void;
  onOpenModal: () => void;
}

function CareGroupsView({ careGroups, members, onRefresh, onOpenModal }: CareGroupsViewProps) {
  const [selectedGroup, setSelectedGroup] = useState<CareGroup | null>(null);
  const [memberToAddId, setMemberToAddId] = useState('');

  const handleGroupSelect = async (group: CareGroup) => {
    try {
      const detailed = await pastoralService.getCareGroupById(group.id!);
      setSelectedGroup(detailed);
    } catch (err) {
      alert('Gagal mengambil data lengkap: ' + err);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !memberToAddId) return;

    try {
      await pastoralService.addCareGroupMember(selectedGroup.id!, memberToAddId);
      setMemberToAddId('');
      
      // refresh details
      const detailed = await pastoralService.getCareGroupById(selectedGroup.id!);
      setSelectedGroup(detailed);
      onRefresh();
    } catch (err: any) {
      alert('Gagal menambahkan anggota: ' + err.message);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedGroup) return;
    if (!confirm('Apakah Anda yakin ingin mengeluarkan anggota ini dari kelompok kasih?')) return;

    try {
      await pastoralService.removeCareGroupMember(selectedGroup.id!, memberId);
      
      // refresh details
      const detailed = await pastoralService.getCareGroupById(selectedGroup.id!);
      setSelectedGroup(detailed);
      onRefresh();
    } catch (err) {
      alert('Gagal mengeluarkan anggota: ' + err);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kelompok kasih ini beserta seluruh datanya?')) return;
    try {
      await pastoralService.deleteCareGroup(id);
      setSelectedGroup(null);
      onRefresh();
    } catch (err) {
      alert('Gagal menghapus kelompok: ' + err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kelompok Kasih & Pendampingan</h2>
          <p className="text-sm text-gray-500">Kelola kelompok bimbingan khusus (new believers, recovery, duka, dll.) untuk pendampingan jemaat secara berlanjut.</p>
        </div>
        <button 
          onClick={onOpenModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-blue-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Kelompok Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Daftar Kelompok</h3>
          {careGroups.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 text-sm">
              Belum ada kelompok kasih dibuat.
            </div>
          ) : (
            careGroups.map((group) => {
              const isSelected = selectedGroup?.id === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => handleGroupSelect(group)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-200 shadow-sm' 
                      : 'bg-white hover:bg-gray-50 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <h4 className="font-extrabold text-gray-900">{group.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{group.description || 'Tidak ada deskripsi'}</p>
                  <div className="mt-3 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                    <span>Pendamping: {group.leaderName || 'N/A'}</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{group.members?.length || 0} JEMAAT</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Group Details & Management */}
        <div className="lg:col-span-2">
          {selectedGroup ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-start gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">{selectedGroup.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedGroup.description || 'Tidak ada deskripsi'}</p>
                  <p className="text-xs text-blue-600 font-bold mt-2">Ketua Pendamping: <strong className="text-gray-800 font-extrabold">{selectedGroup.leaderName || 'Belum Ditentukan'}</strong></p>
                </div>

                <button 
                  onClick={() => handleDeleteGroup(selectedGroup.id!)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                  title="Hapus Kelompok"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Add Member form */}
              <form onSubmit={handleAddMember} className="bg-gray-50 p-4 rounded-xl flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tambahkan Jemaat Pendampingan</label>
                  <select 
                    value={memberToAddId}
                    onChange={(e) => setMemberToAddId(e.target.value)}
                    required
                    className="w-full bg-white border border-gray-250 hover:border-gray-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Jemaat --</option>
                    {members
                      .filter(m => !selectedGroup.members?.some(sgm => sgm.member?.id === m.id))
                      .map(m => (
                        <option key={m.id} value={m.id}>
                          {m.firstName} {m.lastName || ''} ({m.category})
                        </option>
                      ))
                    }
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl cursor-pointer"
                >
                  Tambahkan
                </button>
              </form>

              {/* Members List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Daftar Anggota Kelompok</h4>
                {!selectedGroup.members || selectedGroup.members.length === 0 ? (
                  <p className="text-sm text-gray-500 bg-gray-50/50 p-4 rounded-xl text-center">Belum ada anggota dimasukkan dalam kelompok ini.</p>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto pr-2">
                    {selectedGroup.members.map((relation) => (
                      <div key={relation.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                            {relation.member?.firstName?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-gray-900">{relation.member?.firstName} {relation.member?.lastName || ''}</p>
                            <p className="text-xs text-gray-400 font-semibold">{relation.member?.category || 'ADULT'} | {relation.member?.phone || 'No phone'}</p>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleRemoveMember(relation.member?.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Keluarkan dari kelompok"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-500 flex flex-col items-center justify-center min-h-[350px]">
              <Users2 className="w-12 h-12 text-gray-300 mb-4 animate-bounce" />
              <p className="font-semibold text-lg text-gray-700 mb-1">Pilih Kelompok Kasih</p>
              <p className="text-sm max-w-md">Klik salah satu kelompok di kolom kiri untuk melihat anggota pendampingan, mengelola kontak, atau menambahkan jemaat baru.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 5. Crisis & Emergency Contacts View
interface CrisisViewProps {
  crises: CrisisRecord[];
  members: any[];
  onRefresh: () => void;
  onOpenModal: () => void;
}

function CrisisView({ crises, members, onRefresh, onOpenModal }: CrisisViewProps) {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [contactModal, setContactModal] = useState(false);

  // New emergency contact form state
  const [ecName, setEcName] = useState('');
  const [ecRelationship, setEcRelationship] = useState('');
  const [ecPhone, setEcPhone] = useState('');
  const [ecEmail, setEcEmail] = useState('');
  const [ecIsPrimary, setEcIsPrimary] = useState(false);

  const fetchContacts = async (mId: string) => {
    if (!mId) return;
    try {
      const res = await pastoralService.getEmergencyContacts(mId);
      setContacts(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedMemberId) {
      fetchContacts(selectedMemberId);
    } else {
      setContacts([]);
    }
  }, [selectedMemberId]);

  const handleCrisisStatusChange = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'OPEN' ? 'IN_PROGRESS' : currentStatus === 'IN_PROGRESS' ? 'RESOLVED' : 'OPEN';
    try {
      await pastoralService.updateCrisis(id, { status: nextStatus });
      onRefresh();
    } catch (err) {
      alert('Gagal update: ' + err);
    }
  };

  const handleDeleteCrisis = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus peringatan krisis ini?')) return;
    try {
      await pastoralService.deleteCrisis(id);
      onRefresh();
    } catch (err) {
      alert('Gagal menghapus: ' + err);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    try {
      await pastoralService.createEmergencyContact({
        memberId: selectedMemberId,
        name: ecName,
        relationship: ecRelationship,
        phone: ecPhone,
        email: ecEmail || null,
        isPrimary: ecIsPrimary
      });

      // Reset
      setEcName('');
      setEcRelationship('');
      setEcPhone('');
      setEcEmail('');
      setEcIsPrimary(false);
      setContactModal(false);
      
      // refresh
      fetchContacts(selectedMemberId);
    } catch (err) {
      alert('Gagal membuat kontak: ' + err);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Hapus kontak darurat ini?')) return;
    try {
      await pastoralService.deleteEmergencyContact(id);
      fetchContacts(selectedMemberId);
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Crisis & Emergency Management</h2>
          <p className="text-sm text-gray-500">Tangani musibah jemaat (duka, sakit kritis, bencana) serta kelola kontak darurat untuk aksi respon cepat.</p>
        </div>
        <button 
          onClick={onOpenModal}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-red-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Laporkan Kondisi Krisis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Crisis Alerts */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Peringatan Krisis Aktif</h3>
          {crises.length === 0 ? (
            <div className="border border-gray-100 bg-gray-50 rounded-2xl p-8 text-center text-gray-500 text-sm">
              Tidak ada kondisi krisis jemaat yang aktif dilaporkan saat ini.
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {crises.map((c) => {
                const dateStr = new Date(c.createdAt || '').toLocaleDateString('id-ID', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <div 
                    key={c.id} 
                    className={`border rounded-2xl p-5 shadow-sm transition-all duration-300 relative group flex flex-col justify-between ${
                      c.status === 'RESOLVED'
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : c.severity === 'CRITICAL'
                          ? 'bg-red-50 border-red-200 hover:border-red-400'
                          : c.severity === 'HIGH'
                            ? 'bg-orange-50 border-orange-200 hover:border-orange-400'
                            : 'bg-blue-50 border-blue-200 hover:border-blue-400'
                    }`}
                  >
                    <div>
                      {/* Badge and Status Headers */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${
                          c.severity === 'CRITICAL' 
                            ? 'bg-red-600 text-white animate-pulse' 
                            : c.severity === 'HIGH' 
                              ? 'bg-orange-600 text-white' 
                              : c.severity === 'MEDIUM'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-500 text-white'
                        }`}>
                          {c.severity} CRISIS
                        </span>

                        <button
                          onClick={() => handleCrisisStatusChange(c.id!, c.status)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                            c.status === 'RESOLVED'
                              ? 'bg-green-600 text-white'
                              : c.status === 'IN_PROGRESS'
                                ? 'bg-amber-500 text-white'
                                : 'bg-red-500 text-white'
                          }`}
                        >
                          {c.status === 'RESOLVED' ? '✓ SELESAI' : c.status === 'IN_PROGRESS' ? '⌛ TINDAK LANJUT' : '🚨 KRISIS BARU'}
                        </button>
                      </div>

                      {/* Content */}
                      <h4 className="font-extrabold text-gray-900 text-lg">
                        {c.member ? `${c.member.firstName} ${c.member.lastName || ''}` : 'Jemaat'}
                      </h4>
                      <p className="text-xs text-gray-500 font-semibold mt-0.5">Dilaporkan: {dateStr} | Jenis: <strong>{c.crisisType}</strong></p>

                      <div className="mt-3 bg-white/70 p-3 rounded-xl border border-black/5 text-sm font-semibold text-gray-700">
                        "{c.description}"
                      </div>

                      {c.notes && (
                        <div className="mt-2 text-xs text-gray-600 bg-white/30 p-2.5 rounded-lg border border-black/5">
                          <strong className="text-gray-700">Catatan/Respon:</strong> {c.notes}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/5 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedMemberId(c.memberId);
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-gray-150 border border-gray-250 text-gray-700 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Lihat Kontak Darurat
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteCrisis(c.id!)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Emergency Contacts directory */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Direktori Kontak Darurat Jemaat</h3>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cari & Pilih Jemaat</label>
              <SearchableMemberSelect
                members={members}
                value={selectedMemberId}
                onChange={(val) => setSelectedMemberId(val)}
                placeholder="-- Pilih Jemaat --"
              />
            </div>

            {selectedMemberId ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <h4 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider">Hubungan & Kontak Terkait</h4>
                  <button 
                    onClick={() => setContactModal(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Kontak
                  </button>
                </div>

                {contacts.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4 bg-gray-50 rounded-xl">Belum ada kontak darurat terdaftar untuk jemaat ini.</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="bg-gray-50/50 p-4 border border-gray-100 rounded-xl flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                            {contact.name}
                            {contact.isPrimary && (
                              <span className="bg-red-50 text-red-600 text-[8px] font-bold px-1.5 py-0.5 rounded">UTAMA</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 font-semibold uppercase">{contact.relationship}</p>
                          
                          <div className="mt-2 text-xs text-gray-600 space-y-1 pt-1.5 border-t border-gray-100/50">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{contact.phone}</span>
                            </div>
                            {contact.email && (
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span>{contact.email}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeleteContact(contact.id!)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-xs flex flex-col items-center justify-center gap-2 border border-dashed border-gray-200 rounded-xl bg-gray-50/20">
                <Search className="w-6 h-6 text-gray-300" />
                <p>Silakan pilih jemaat di atas untuk melihat daftar kontak keluarga terdekat jemaat terkait.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Emergency contact Modal */}
      {contactModal && (
        <ModalOverlay onClose={() => setContactModal(false)}>
          <form onSubmit={handleAddContact} className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              Kontak Darurat Baru
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nama Kontak</label>
                <input 
                  type="text" 
                  value={ecName} 
                  onChange={(e) => setEcName(e.target.value)} 
                  required
                  placeholder="Contoh: Budi Santoso"
                  className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Hubungan</label>
                  <input 
                    type="text" 
                    value={ecRelationship} 
                    onChange={(e) => setEcRelationship(e.target.value)} 
                    required
                    placeholder="Contoh: Suami / Istri / Anak"
                    className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Telepon (Nomor HP)</label>
                  <input 
                    type="tel" 
                    value={ecPhone} 
                    onChange={(e) => setEcPhone(e.target.value)} 
                    required
                    placeholder="0812345678"
                    className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email (Opsional)</label>
                <input 
                  type="email" 
                  value={ecEmail} 
                  onChange={(e) => setEcEmail(e.target.value)} 
                  placeholder="budi@gmail.com"
                  className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="primaryContact" 
                  checked={ecIsPrimary} 
                  onChange={(e) => setEcIsPrimary(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="primaryContact" className="text-xs font-bold text-gray-600 uppercase cursor-pointer">Jadikan Sebagai Kontak Utama</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setContactModal(false)}
                className="px-4 py-2 border border-gray-250 text-gray-700 font-bold text-sm rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}
    </div>
  );
}

// ==========================================
// FORM COMPONENTS
// ==========================================

// 1. Visitation Form
interface VisitationFormProps {
  members: any[];
  onClose: () => void;
  onRefresh: () => void;
  initialData?: PastoralVisitation | null;
}

function VisitationForm({ members, onClose, onRefresh, initialData }: VisitationFormProps) {
  const [mId, setMId] = useState(initialData?.memberId || '');
  const [visitor, setVisitor] = useState(initialData?.visitorName || '');
  const [date, setDate] = useState(() => {
    if (!initialData?.visitDate) return '';
    const d = new Date(initialData.visitDate);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
  });
  const [vType, setVType] = useState<'HOME' | 'HOSPITAL' | 'OTHER'>(initialData?.type || 'HOME');
  const [vStatus, setVStatus] = useState<'PLANNED' | 'COMPLETED' | 'CANCELLED'>(initialData?.status || 'PLANNED');
  const [purpose, setPurpose] = useState(initialData?.purpose || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        memberId: mId,
        visitorName: visitor,
        visitDate: new Date(date).toISOString(),
        type: vType,
        status: vStatus,
        purpose,
        notes: notes || null
      };
      if (initialData?.id) {
        await pastoralService.updateVisitation(initialData.id, payload);
      } else {
        await pastoralService.createVisitation(payload);
      }
      onRefresh();
      onClose();
    } catch (err) {
      alert(`Gagal ${initialData ? 'mengubah' : 'mencatat'} kunjungan: ` + err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <HeartHandshake className="w-5 h-5 text-rose-500" />
        {initialData ? 'Edit Log Kunjungan Jemaat' : 'Log Kunjungan Jemaat Baru'}
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Pilih Jemaat</label>
          <SearchableMemberSelect
            members={members}
            value={mId}
            onChange={(val) => setMId(val)}
            required
            placeholder="-- Pilih Jemaat --"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Dilayani Oleh (Pelayan)</label>
            <input 
              type="text" 
              value={visitor} 
              onChange={(e) => setVisitor(e.target.value)} 
              required
              placeholder="Contoh: Pdt. Yohanes"
              className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tanggal & Jam</label>
            <input 
              type="datetime-local" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              required
              className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Jenis Kunjungan</label>
            <select 
              value={vType} 
              onChange={(e) => setVType(e.target.value as any)}
              className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="HOME">Rumah (Home)</option>
              <option value="HOSPITAL">Rumah Sakit (Hospital)</option>
              <option value="OTHER">Lainnya (Other)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Status Rencana</label>
            <select 
              value={vStatus} 
              onChange={(e) => setVStatus(e.target.value as any)}
              className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="PLANNED">Direncanakan (Planned)</option>
              <option value="COMPLETED">Selesai (Completed)</option>
              <option value="CANCELLED">Batal (Cancelled)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tujuan / Masalah / Pokok Kunjungan</label>
          <input 
            type="text" 
            value={purpose} 
            onChange={(e) => setPurpose(e.target.value)} 
            required
            placeholder="Contoh: Mendoakan kesembuhan pasca sakit keras"
            className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Catatan Tambahan (Opsional)</label>
          <textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Tuliskan feedback kunjungan atau pesan pelayanan untuk gereja..."
            rows={3}
            className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button 
          type="button" 
          onClick={onClose}
          className="px-4 py-2 border border-gray-250 text-gray-700 font-bold text-sm rounded-xl cursor-pointer"
        >
          Batal
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl cursor-pointer"
        >
          Simpan
        </button>
      </div>
    </form>
  );
}

// 2. Counseling Form
interface CounselingFormProps {
  members: any[];
  onClose: () => void;
  onRefresh: () => void;
  initialData?: CounselingRecord | null;
}

function CounselingForm({ members, onClose, onRefresh, initialData }: CounselingFormProps) {
  const [mId, setMId] = useState(initialData?.memberId || '');
  const [cName, setCName] = useState(initialData?.counselorName || '');
  const [date, setDate] = useState(() => {
    if (!initialData?.counselingDate) return '';
    const d = new Date(initialData.counselingDate);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
  });
  const [title, setTitle] = useState(initialData?.title || '');
  const [issue, setIssue] = useState(initialData?.issueDescription || '');
  const [actionPlan, setActionPlan] = useState(initialData?.actionPlan || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isPrivate, setIsPrivate] = useState(initialData !== undefined && initialData !== null ? initialData.isPrivate : true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        memberId: mId,
        counselorName: cName,
        counselingDate: new Date(date).toISOString(),
        title,
        issueDescription: issue,
        actionPlan: actionPlan || null,
        notes,
        isPrivate
      };
      if (initialData?.id) {
        await pastoralService.updateCounseling(initialData.id, payload);
      } else {
        await pastoralService.createCounseling(payload);
      }
      onRefresh();
      onClose();
    } catch (err) {
      alert(`Gagal ${initialData ? 'mengubah' : 'menyimpan'} sesi konseling: ` + err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-indigo-600" />
        {initialData ? 'Edit Rekam Sesi Konseling' : 'Log Rekam Sesi Konseling Baru'}
      </h3>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Pilih Konseli (Jemaat)</label>
            <SearchableMemberSelect
              members={members}
              value={mId}
              onChange={(val) => setMId(val)}
              required
              placeholder="-- Pilih Konseli --"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nama Konselor</label>
            <input 
              type="text" 
              value={cName} 
              onChange={(e) => setCName(e.target.value)} 
              required
              placeholder="Contoh: Pdt. Markus"
              className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tanggal & Waktu</label>
            <input 
              type="datetime-local" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              required
              className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Judul / Masalah Utama</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required
              placeholder="Contoh: Masalah Ekonomi Keluarga"
              className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Deskripsi Permasalahan</label>
          <textarea 
            value={issue} 
            onChange={(e) => setIssue(e.target.value)} 
            required
            placeholder="Tuliskan intisari pokok masalah yang dihadapi konseli..."
            rows={2}
            className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Action Plan / Rencana Tindak Lanjut</label>
          <input 
            type="text" 
            value={actionPlan} 
            onChange={(e) => setActionPlan(e.target.value)} 
            placeholder="Contoh: Mengagendakan konseling lanjutan bersama pasangan hidup"
            className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 font-extrabold text-rose-600">Catatan Detail Konseling (Sangat Rahasia)</label>
          <textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            required
            placeholder="Tuliskan kronologi lengkap, ayat rujukan, dan tanggapan konseling secara lengkap di sini..."
            rows={4}
            className="w-full bg-white border border-indigo-200 focus:border-indigo-400 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input 
            type="checkbox" 
            id="privacyLock" 
            checked={isPrivate} 
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="rounded text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="privacyLock" className="text-xs font-bold text-indigo-950 uppercase cursor-pointer flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-rose-500" />
            Proteksi Rekaman Ini (Hanya Konselor & Pastor yang dapat membuka)
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button 
          type="button" 
          onClick={onClose}
          className="px-4 py-2 border border-gray-250 text-gray-700 font-bold text-sm rounded-xl cursor-pointer"
        >
          Batal
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl cursor-pointer"
        >
          Simpan Rekaman
        </button>
      </div>
    </form>
  );
}

// 3. Prayer Request Form
function PrayerForm({ members, onClose, onRefresh }: FormProps) {
  const [mId, setMId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pastoralService.createPrayer({
        memberId: mId || null,
        requesterName: name,
        requesterEmail: email || null,
        requesterPhone: phone || null,
        content,
        isAnonymous,
        isPrivate,
        status: 'PENDING'
      });
      onRefresh();
      onClose();
    } catch (err) {
      alert('Gagal mengirim pokok doa: ' + err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Flame className="w-5 h-5 text-amber-500" />
        Kirim Pokok Doa Jemaat Baru
      </h3>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Hubungkan Jemaat (Opsional)</label>
            <select 
              value={mId} 
              onChange={(e) => {
                setMId(e.target.value);
                const mem = members.find(m => m.id === e.target.value);
                if (mem) {
                  setName(`${mem.firstName} ${mem.lastName || ''}`.trim());
                  setEmail(mem.email || '');
                  setPhone(mem.phone || '');
                }
              }}
              className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Pilih Profil (Jika ada) --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.firstName} {m.lastName || ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nama Pemohon</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
              placeholder="Masukkan nama pengirim doa"
              className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Pemohon</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="alamat@gmail.com"
              className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Telepon (WA)</label>
            <input 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="0812xxxx"
              className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Isi Pokok Doa (Syafaat)</label>
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required
            placeholder="Tuliskan hal doa syafaat yang ingin didukung gereja..."
            rows={4}
            className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isAnon" 
              checked={isAnonymous} 
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500"
            />
            <label htmlFor="isAnon" className="text-xs font-bold text-gray-600 uppercase cursor-pointer">Sembunyikan Nama (Anonim)</label>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isPriv" 
              checked={isPrivate} 
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="isPriv" className="text-xs font-bold text-gray-600 uppercase cursor-pointer flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-purple-600" /> Privat (Hanya Pastor)</label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button 
          type="button" 
          onClick={onClose}
          className="px-4 py-2 border border-gray-250 text-gray-700 font-bold text-sm rounded-xl cursor-pointer"
        >
          Batal
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl cursor-pointer"
        >
          Kirim Pokok Doa
        </button>
      </div>
    </form>
  );
}

// 4. Care Group Form
interface CareGroupFormProps {
  onClose: () => void;
  onRefresh: () => void;
}

function CareGroupForm({ onClose, onRefresh }: CareGroupFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leader, setLeader] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pastoralService.createCareGroup({
        name,
        description: description || null,
        leaderName: leader || null
      });
      onRefresh();
      onClose();
    } catch (err) {
      alert('Gagal membuat kelompok bimbingan: ' + err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Users2 className="w-5 h-5 text-blue-600" />
        Buat Kelompok Kasih & Pendampingan Baru
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nama Kelompok</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required
            placeholder="Contoh: Kelompok Duka Harapan / New Believers Class"
            className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nama Pembimbing / Mentor Utama</label>
          <input 
            type="text" 
            value={leader} 
            onChange={(e) => setLeader(e.target.value)} 
            placeholder="Contoh: Ev. Sutrisno"
            className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tujuan / Deskripsi Kelompok</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Tuliskan visi, misi, atau jadwal pertemuan pendampingan..."
            rows={3}
            className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button 
          type="button" 
          onClick={onClose}
          className="px-4 py-2 border border-gray-250 text-gray-700 font-bold text-sm rounded-xl cursor-pointer"
        >
          Batal
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl cursor-pointer"
        >
          Buat Kelompok
        </button>
      </div>
    </form>
  );
}

// 5. Crisis Form
function CrisisForm({ members, onClose, onRefresh }: FormProps) {
  const [mId, setMId] = useState('');
  const [type, setType] = useState<'BEREAVEMENT' | 'SICKNESS' | 'FINANCIAL' | 'FAMILY' | 'ACCIDENT' | 'OTHER'>('SICKNESS');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pastoralService.createCrisis({
        memberId: mId,
        crisisType: type,
        severity,
        description,
        status: 'OPEN',
        notes: notes || null
      });
      onRefresh();
      onClose();
    } catch (err) {
      alert('Gagal merekam krisis: ' + err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <AlertOctagon className="w-5 h-5 text-red-600" />
        Laporkan Krisis / Kondisi Darurat Jemaat
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Jemaat yang Terkena Musibah</label>
          <SearchableMemberSelect
            members={members}
            value={mId}
            onChange={(val) => setMId(val)}
            required
            placeholder="-- Pilih Jemaat --"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Jenis Musibah / Krisis</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="SICKNESS">Sakit Kritis / Opname</option>
              <option value="BEREAVEMENT">Duka Cita (Meninggal)</option>
              <option value="FINANCIAL">Krisis Finansial / Kebakaran</option>
              <option value="FAMILY">Keluarga (KDRT / Keretakan)</option>
              <option value="ACCIDENT">Kecelakaan / Cedera</option>
              <option value="OTHER">Lain-lain / Force Majeure</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tingkat Keparahan (Severity)</label>
            <select 
              value={severity} 
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="LOW">Rendah (Low)</option>
              <option value="MEDIUM">Sedang (Medium)</option>
              <option value="HIGH">Tinggi (High)</option>
              <option value="CRITICAL">🚨 Sangat Darurat (Critical)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Kronologi / Penjelasan Singkat Krisis</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required
            placeholder="Tuliskan kronologi darurat dan dukungan yang segera dibutuhkan..."
            rows={3}
            className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Langkah Penanganan Pertama / Catatan</label>
          <input 
            type="text" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Contoh: Mengatur jadwal duka cita / Mengirimkan karangan bunga"
            className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button 
          type="button" 
          onClick={onClose}
          className="px-4 py-2 border border-gray-250 text-gray-700 font-bold text-sm rounded-xl cursor-pointer"
        >
          Batal
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl cursor-pointer"
        >
          Laporkan Krisis
        </button>
      </div>
    </form>
  );
}

// ==========================================
// UTILITY OVERLAYS
// ==========================================

interface ModalOverlayProps {
  onClose: () => void;
  children: React.ReactNode;
}

function ModalOverlay({ onClose, children }: ModalOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div 
        className="fixed inset-0 bg-transparent" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-gray-150 transform scale-100 transition-transform duration-300 max-h-[90vh] overflow-y-auto z-10">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
