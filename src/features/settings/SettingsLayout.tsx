import React, { useState } from 'react';
import ChurchProfileForm from './ChurchProfileForm';
import ConfigurationForm from './ConfigurationForm';
import BrandingForm from './BrandingForm';
import BranchManager from './BranchManager';

export default function SettingsLayout() {
    const [activeTab, setActiveTab] = useState<'profile' | 'config' | 'branch' | 'branding'>('profile');

    const tabs = [
        { id: 'profile', name: 'Church Profile' },
        { id: 'config', name: 'Preferences' },
        { id: 'branch', name: 'Branches' },
        { id: 'branding', name: 'Branding' }
    ] as const;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Organization Setup</h2>
                <p className="text-gray-500 text-sm mt-1">Manage your church wide preferences, profiles, and domains.</p>
            </div>

            {/* Tabs Layout */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                \${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Dynamic Tab Body */}
            <div className="py-4">
                {activeTab === 'profile' && <ChurchProfileForm />}
                {activeTab === 'config' && <ConfigurationForm />}
                {activeTab === 'branch' && <BranchManager />}
                {activeTab === 'branding' && <BrandingForm />}
            </div>

        </div>
    );
}
