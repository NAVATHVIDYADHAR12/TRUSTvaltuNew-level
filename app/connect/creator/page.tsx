"use client";

import React, { useState } from "react";
import SecureDashboard from "../../_components/SecureDashboard";
import WatermarkStudio from "../../_components/WatermarkStudio";
import SecureViewer from "../../_components/SecureViewer";
import DRMSettings from "../../_components/DRMSettings";
import AgencyAnalytics from "../../_components/AgencyAnalytics";
import FileHistoryPanel from "../../_components/FileHistoryPanel";
import CreatorWallet from "../../_components/CreatorWallet";

export default function CreatorConnect() {
    const [activeTab, setActiveTab] = useState<'studio' | 'viewer' | 'settings' | 'analytics' | 'files' | 'wallet'>('studio');
    const [isClientMode, setIsClientMode] = useState(false);
    const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);

    return (
        <SecureDashboard
            agencyId="creator-view"
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isClientMode={isClientMode}
            onToggleMode={() => setIsClientMode(!isClientMode)}
        >
            <div className="flex h-full gap-6">
                <div className="flex-1 h-full min-h-0">
                    {activeTab === 'studio' && <WatermarkStudio />}
                    {activeTab === 'viewer' && <SecureViewer />}
                    {activeTab === 'files' && <FileHistoryPanel />}
                    {activeTab === 'settings' && <DRMSettings />}
                    {activeTab === 'analytics' && <AgencyAnalytics />}
                    {activeTab === 'wallet' && <CreatorWallet isAddMoneyOpen={isAddMoneyOpen} onToggleAddMoney={setIsAddMoneyOpen} />}
                </div>
            </div>
        </SecureDashboard>
    );
}
