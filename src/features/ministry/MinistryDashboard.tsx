import React, { useState } from 'react';
import { Users, ClipboardList, Calendar, Sparkles } from 'lucide-react';
import MinistryGroups from './MinistryGroups';
import VolunteerBoard from './VolunteerBoard';
import ServiceRoster from './ServiceRoster';
import SkillDatabase from './SkillDatabase';

type Tab = 'GROUPS' | 'VOLUNTEERS' | 'ROSTER' | 'TALENTS';

export default function MinistryDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('GROUPS');

    const tabs = [
        { id: 'GROUPS', name: 'Ministry Groups', icon: Users },
        { id: 'VOLUNTEERS', name: 'Volunteer Board', icon: ClipboardList },
        { id: 'ROSTER', name: 'Service Roster', icon: Calendar },
        { id: 'TALENTS', name: 'Talent Database', icon: Sparkles },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ministry Management</h1>
                    <p className="text-sm text-gray-500">Coordinate groups, volunteers, and service schedules.</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar bg-white rounded-t-xl px-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                        {tab.name}
                    </button>
                ))}
            </div>

            <div className="bg-white p-6 rounded-b-xl shadow-sm border border-t-0 border-gray-100">
                {activeTab === 'GROUPS' && <MinistryGroups />}
                {activeTab === 'VOLUNTEERS' && <VolunteerBoard />}
                {activeTab === 'ROSTER' && <ServiceRoster />}
                {activeTab === 'TALENTS' && <SkillDatabase />}
            </div>
        </div>
    );
}
