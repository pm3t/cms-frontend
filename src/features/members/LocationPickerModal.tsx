import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { X, MapPin, Search, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issues in React/Vite builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (locationData: {
    latitude: number;
    longitude: number;
    address?: string;
    rayon?: string;
    district?: string;
    city?: string;
    postalCode?: string;
  }) => Promise<void>;
  initialData?: {
    latitude?: number | null;
    longitude?: number | null;
    address?: string;
    rayon?: string;
    district?: string;
    city?: string;
    postalCode?: string;
    name?: string;
  };
}

export default function LocationPickerModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: LocationPickerModalProps) {
  // Default coordinates: Jakarta center (-6.2088, 106.8456)
  const defaultLat = -6.2088;
  const defaultLng = 106.8456;

  const [lat, setLat] = useState<number>(initialData?.latitude || defaultLat);
  const [lng, setLng] = useState<number>(initialData?.longitude || defaultLng);
  const [address, setAddress] = useState<string>(initialData?.address || '');
  const [rayon, setRayon] = useState<string>(initialData?.rayon || '');
  const [district, setDistrict] = useState<string>(initialData?.district || '');
  const [city, setCity] = useState<string>(initialData?.city || '');
  const [postalCode, setPostalCode] = useState<string>(initialData?.postalCode || '');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Sync state when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      const initialLat = initialData?.latitude || defaultLat;
      const initialLng = initialData?.longitude || defaultLng;
      setLat(initialLat);
      setLng(initialLng);
      setAddress(initialData?.address || '');
      setRayon(initialData?.rayon || '');
      setDistrict(initialData?.district || '');
      setCity(initialData?.city || '');
      setPostalCode(initialData?.postalCode || '');
    }
  }, [isOpen, initialData]);

  // Initialize and update Leaflet map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Small delay to ensure modal DOM is mounted and visible
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView([lat, lng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const customMarker = L.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current = customMarker;

        // Map click handler to move pin
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat: clickLat, lng: clickLng } = e.latlng;
          setLat(clickLat);
          setLng(clickLng);
          customMarker.setLatLng([clickLat, clickLng]);
        });

        // Marker drag handler
        customMarker.on('dragend', () => {
          const position = customMarker.getLatLng();
          setLat(position.lat);
          setLng(position.lng);
        });

        mapInstanceRef.current = map;
      } else {
        const map = mapInstanceRef.current;
        map.invalidateSize();
        map.setView([lat, lng], 13);
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current && !isOpen) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  // Update map view when lat/lng change from inputs
  const updateMapPosition = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
      mapInstanceRef.current.panTo([newLat, newLng]);
    }
  };

  // Address search using Nominatim OpenStreetMap
  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const first = data[0];
        const newLat = parseFloat(first.lat);
        const newLng = parseFloat(first.lon);
        updateMapPosition(newLat, newLng);
        if (!address) setAddress(first.display_name);
      } else {
        alert('Alamat tidak ditemukan. Silakan klik langsung posisi di peta.');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mencari alamat via Nominatim.');
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        latitude: lat,
        longitude: lng,
        address: address || undefined,
        rayon: rayon || undefined,
        district: district || undefined,
        city: city || undefined,
        postalCode: postalCode || undefined,
      });
      onClose();
    } catch (err: any) {
      alert('Gagal menyimpan lokasi: ' + (err.message || 'Error occurred'));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 flex justify-between items-center border-b border-gray-100 bg-gray-50/60">
          <div>
            <h3 className="font-bold text-lg text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Tetapkan Lokasi Peta {initialData?.name ? `- ${initialData.name}` : ''}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Klik pada peta atau geser pin marker untuk menentukan koordinat tempat tinggal jemaat.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Search Box */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari lokasi/alamat (contoh: Jalan Kebon Sirih Jakarta)..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress()}
              />
            </div>
            <Button onClick={handleSearchAddress} disabled={searching} variant="outline">
              <Navigation className="w-4 h-4 mr-1 text-blue-600" />
              {searching ? 'Cari...' : 'Cari di Peta'}
            </Button>
          </div>

          {/* Map View */}
          <div className="relative w-full h-[320px] rounded-xl border border-gray-200 overflow-hidden shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full z-0" />
            <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 shadow-sm">
              Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
            </div>
          </div>

          {/* Form Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Latitude (Garis Lintang)</label>
              <Input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => updateMapPosition(parseFloat(e.target.value) || 0, lng)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Longitude (Garis Bujur)</label>
              <Input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => updateMapPosition(lat, parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Rayon / Sektor Wilayah</label>
              <Input
                placeholder="e.g. Rayon 1 / Sektor Barat"
                value={rayon}
                onChange={(e) => setRayon(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Lengkap</label>
              <Input
                placeholder="e.g. Jl. Jendral Sudirman No. 45"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Kecamatan (District)</label>
              <Input
                placeholder="e.g. Menteng"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Kota / Kabupaten</label>
              <Input
                placeholder="e.g. Jakarta Pusat"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Kode Pos</label>
              <Input
                placeholder="e.g. 10310"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Lokasi'}
          </Button>
        </div>
      </div>
    </div>
  );
}
