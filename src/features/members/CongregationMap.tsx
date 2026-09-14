import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
  MapPin,
  Search,
  Filter,
  Users,
  Building2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Map,
  List,
  Edit3,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import api from '../../lib/axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LocationPickerModal from './LocationPickerModal';
import { resolveFileUrl } from '../../lib/config';

// Color map for Member Categories
const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; pinHex: string }> = {
  ADULT: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-700', pinHex: '#2563eb' },
  YOUTH: { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-700', pinHex: '#9333ea' },
  CHILDREN: { bg: 'bg-emerald-100', border: 'border-emerald-500', text: 'text-emerald-700', pinHex: '#059669' },
  ELDERLY: { bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-700', pinHex: '#d97706' },
};

export default function CongregationMap() {
  const [loading, setLoading] = useState<boolean>(true);
  const [mapData, setMapData] = useState<any>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [rayonFilter, setRayonFilter] = useState<string>('');
  const [hasCoordsFilter, setHasCoordsFilter] = useState<string>('');

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'map' | 'unmapped'>('map');

  // Modal State for Location Picker
  const [pickerModalOpen, setPickerModalOpen] = useState<boolean>(false);
  const [selectedMemberForPicker, setSelectedMemberForPicker] = useState<any>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (rayonFilter) params.rayon = rayonFilter;
      if (hasCoordsFilter) params.hasCoordinates = hasCoordsFilter;

      const res = await api.get('/members/map', { params });
      setMapData(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, [categoryFilter, statusFilter, rayonFilter, hasCoordsFilter]);

  // Handle Search submit / debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMapData();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Leaflet Map Initialization & Markers Update
  useEffect(() => {
    if (activeTab !== 'map' || !mapContainerRef.current || !mapData) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      const members = mapData.members || [];
      const mappedMembers = members.filter((m: any) => m.latitude !== null && m.longitude !== null);

      // Center location default (Church HQ or Jakarta)
      let centerLat = mapData.tenantHQ?.latitude || -6.2088;
      let centerLng = mapData.tenantHQ?.longitude || 106.8456;

      if (mappedMembers.length > 0) {
        centerLat = mappedMembers[0].latitude;
        centerLng = mappedMembers[0].longitude;
      }

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        markersGroupRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.invalidateSize();
      }

      const map = mapInstanceRef.current;
      const markersGroup = markersGroupRef.current;

      if (markersGroup) {
        markersGroup.clearLayers();
      }

      const bounds: L.LatLngExpression[] = [];

      // Add Church HQ Marker if present
      if (mapData.tenantHQ?.latitude && mapData.tenantHQ?.longitude) {
        const hqIcon = L.divIcon({
          className: 'custom-church-pin',
          html: `<div style="background-color: #1e293b; color: white; width: 36px; height: 36px; borderRadius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-weight: bold;">⛪</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const hqMarker = L.marker([mapData.tenantHQ.latitude, mapData.tenantHQ.longitude], { icon: hqIcon })
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 4px;">
              <strong style="font-size: 14px; color: #0f172a;">${mapData.tenantHQ.name || 'Gereja Pusat'}</strong>
              <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">${mapData.tenantHQ.address || 'Gedung Ibadah'}</p>
            </div>
          `);

        if (markersGroup) hqMarker.addTo(markersGroup);
        bounds.push([mapData.tenantHQ.latitude, mapData.tenantHQ.longitude]);
      }

      // Add Member Markers
      mappedMembers.forEach((member: any) => {
        const colorConfig = CATEGORY_COLORS[member.category] || CATEGORY_COLORS.ADULT;
        const initial = member.firstName?.charAt(0) || 'J';

        const customIcon = L.divIcon({
          className: 'custom-member-pin',
          html: `
            <div style="
              background-color: ${colorConfig.pinHex};
              color: white;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 2px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 13px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.25);
              cursor: pointer;
            ">
              ${initial}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const popupContent = document.createElement('div');
        popupContent.style.fontFamily = 'sans-serif';
        popupContent.style.minWidth = '220px';
        popupContent.innerHTML = `
          <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 8px;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-weight: bold; overflow: hidden; shrink: 0;">
              ${
                member.photoUrl
                  ? `<img src="${resolveFileUrl(member.photoUrl)}" style="width:100%; height:100%; object-fit:cover;" />`
                  : `<span style="color:#3b82f6; font-size:14px;">${initial}</span>`
              }
            </div>
            <div>
              <h4 style="margin:0; font-size:14px; font-weight:bold; color:#0f172a;">${member.firstName} ${member.lastName || ''}</h4>
              <span style="font-size:11px; font-weight:bold; background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:10px; display:inline-block; margin-top:2px;">
                ${member.category} • ${member.status}
              </span>
            </div>
          </div>
          <div style="font-size:12px; color:#475569; margin-bottom: 6px; line-height: 1.4;">
            <div><strong>Alamat:</strong> ${member.address || 'Belum diisi'}</div>
            <div><strong>Rayon:</strong> ${member.rayon || 'Belum diisi'}</div>
            <div><strong>Telepon:</strong> ${member.phone || '-'}</div>
            ${member.family ? `<div><strong>Keluarga:</strong> ${member.family.name}</div>` : ''}
          </div>
          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <button id="btn-edit-loc-${member.id}" style="flex:1; background:#2563eb; color:white; border:none; padding:6px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">
              Ubah Lokasi
            </button>
            <a href="/members/${member.id}" style="text-decoration:none; background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:bold; text-align:center;">
              Profil
            </a>
          </div>
        `;

        const marker = L.marker([member.latitude, member.longitude], { icon: customIcon })
          .bindPopup(popupContent);

        marker.on('popupopen', () => {
          setTimeout(() => {
            const btn = document.getElementById(`btn-edit-loc-${member.id}`);
            if (btn) {
              btn.onclick = () => {
                setSelectedMemberForPicker(member);
                setPickerModalOpen(true);
              };
            }
          }, 50);
        });

        if (markersGroup) marker.addTo(markersGroup);
        bounds.push([member.latitude, member.longitude]);
      });

      // Fit bounds if markers exist
      if (bounds.length > 0 && map) {
        if (bounds.length === 1) {
          map.setView(bounds[0], 14);
        } else {
          map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 15 });
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [activeTab, mapData]);

  // Handle location update save from modal
  const handleSaveLocation = async (locData: any) => {
    if (!selectedMemberForPicker) return;
    try {
      await api.patch(`/members/${selectedMemberForPicker.id}/location`, locData);
      await fetchMapData();
    } catch (err: any) {
      alert('Gagal update lokasi: ' + (err.response?.data?.error || err.message));
    }
  };

  const metrics = mapData?.metrics || {
    totalMembers: 0,
    mappedMembersCount: 0,
    unmappedMembersCount: 0,
    mappedPercentage: 0,
    byRayon: {},
    byCategory: {},
  };

  const unmappedList = (mapData?.members || []).filter(
    (m: any) => m.latitude === null || m.longitude === null
  );

  const rayonOptions = Object.keys(metrics.byRayon || {});

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <MapPin className="w-7 h-7 mr-2 text-blue-600" />
            Peta Sebaran Jemaat
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Visualisasi distribusi lokasi tempat tinggal jemaat dan pemetaan wilayah rayon.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={fetchMapData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Jemaat</p>
            <h3 className="text-2xl font-bold text-gray-900">{metrics.totalMembers}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Terpetakan (Koordinat)</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-gray-900">{metrics.mappedMembersCount}</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {metrics.mappedPercentage}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Belum Terpetakan</p>
            <h3 className="text-2xl font-bold text-gray-900">{metrics.unmappedMembersCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Wilayah / Rayon</p>
            <h3 className="text-2xl font-bold text-gray-900">{rayonOptions.length}</h3>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/70 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari jemaat, rayon, alamat..."
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              <option value="ADULT">Dewasa (Adult)</option>
              <option value="YOUTH">Remaja (Youth)</option>
              <option value="CHILDREN">Anak (Children)</option>
              <option value="ELDERLY">Lansia (Elderly)</option>
            </select>

            {/* Rayon Filter */}
            <select
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={rayonFilter}
              onChange={(e) => setRayonFilter(e.target.value)}
            >
              <option value="">Semua Rayon / Sektor</option>
              {rayonOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {/* Has Coords Filter */}
            <select
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={hasCoordsFilter}
              onChange={(e) => setHasCoordsFilter(e.target.value)}
            >
              <option value="">Semua Status Peta</option>
              <option value="true">Sudah Ada Koordinat</option>
              <option value="false">Belum Ada Koordinat</option>
            </select>
          </div>

          {/* View Tab Switcher */}
          <div className="flex bg-gray-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Map className="w-3.5 h-3.5 mr-1.5" />
              Peta Interaktif
            </button>
            <button
              onClick={() => setActiveTab('unmapped')}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'unmapped' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-3.5 h-3.5 mr-1.5" />
              Belum Terpetakan ({unmappedList.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'map' ? (
          <div className="relative w-full h-[600px] bg-gray-100">
            {loading && (
              <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-xs flex items-center justify-center font-semibold text-gray-600">
                Memuat data sebaran peta...
              </div>
            )}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Legend Overlay */}
            <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-gray-200 shadow-lg text-xs space-y-2">
              <p className="font-bold text-gray-800 border-b pb-1">Legenda Kategori Jemaat</p>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block border border-white"></span>
                <span className="text-gray-700">Dewasa (Adult)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600 inline-block border border-white"></span>
                <span className="text-gray-700">Remaja (Youth)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block border border-white"></span>
                <span className="text-gray-700">Anak (Children)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-600 inline-block border border-white"></span>
                <span className="text-gray-700">Lansia (Elderly)</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-900 text-[9px] text-white flex items-center justify-center font-bold">
                  ⛪
                </span>
                <span className="text-gray-800 font-bold">Gereja Pusat (HQ)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Daftar Jemaat Belum Terpetakan</h3>
            <p className="text-sm text-gray-500 mb-6">
              Jemaat berikut belum memiliki data koordinat lokasi (Latitude & Longitude). Klik "Tetapkan di Peta" untuk menentukan posisi tempat tinggal mereka.
            </p>

            {unmappedList.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                Semua jemaat hasil filter telah memiliki koordinat lokasi di peta!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unmappedList.map((member: any) => (
                  <div
                    key={member.id}
                    className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          {member.category}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {member.rayon ? `Rayon: ${member.rayon}` : 'Rayon Belum Set'}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-base">
                        {member.firstName} {member.lastName}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        📍 {member.address || 'Alamat belum diisi'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">📞 {member.phone || 'No telp -'}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <Link
                        to={`/members/${member.id}`}
                        className="text-xs text-gray-600 hover:text-blue-600 flex items-center font-medium"
                      >
                        Detail Profil <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedMemberForPicker(member);
                          setPickerModalOpen(true);
                        }}
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                        Tetapkan di Peta
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={pickerModalOpen}
        onClose={() => setPickerModalOpen(false)}
        onSave={handleSaveLocation}
        initialData={
          selectedMemberForPicker
            ? {
                latitude: selectedMemberForPicker.latitude,
                longitude: selectedMemberForPicker.longitude,
                address: selectedMemberForPicker.address,
                rayon: selectedMemberForPicker.rayon,
                district: selectedMemberForPicker.district,
                city: selectedMemberForPicker.city,
                postalCode: selectedMemberForPicker.postalCode,
                name: `${selectedMemberForPicker.firstName} ${selectedMemberForPicker.lastName || ''}`,
              }
            : undefined
        }
      />
    </div>
  );
}
