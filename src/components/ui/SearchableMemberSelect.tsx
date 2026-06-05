import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface SearchableMemberSelectProps {
  members: any[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function SearchableMemberSelect({ 
  members, 
  value, 
  onChange, 
  placeholder = "-- Pilih Jemaat --", 
  required = false 
}: SearchableMemberSelectProps) {
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
    <div className="relative w-full text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery('');
        }}
        className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none flex justify-between items-center text-left transition-all"
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
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-250 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col">
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
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 hover:text-purple-600 transition-colors flex justify-between items-center ${
                      isSelected ? 'bg-purple-50/50 text-purple-600 font-semibold' : 'text-gray-700'
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
