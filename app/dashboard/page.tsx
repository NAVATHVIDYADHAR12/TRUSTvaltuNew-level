"use client";
// Force rebuild


import React, { useState, use, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SecureDashboard from "../_components/SecureDashboard";
import WatermarkStudio from "../_components/WatermarkStudio";
import SecureViewer from "../_components/SecureViewer";
import DRMSettings from "../_components/DRMSettings";
import AIAgentPanel from "../_components/AIAgentPanel";
import AgencyAnalytics from "../_components/AgencyAnalytics";
import FileHistoryPanel from "../_components/FileHistoryPanel";
import CreatorWallet from "../_components/CreatorWallet";

export default function AgencyConnectPage({ params }: { params: { id: string } }) {
    // Params is an object in Next.js 14, no need to unwrap
    // Modified for CreatorSecure static route: default to 'a1' since there are no dynamic params
    const id = params?.id || 'a1';
    const searchParams = useSearchParams();

    const [activeTab, setActiveTab] = useState<'studio' | 'viewer' | 'settings' | 'analytics' | 'files' | 'wallet'>('viewer');
    const [isClientMode, setIsClientMode] = useState(false);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

    useEffect(() => {
        const viewMode = searchParams?.get('view');
        const tabParam = searchParams?.get('tab');

        if (viewMode === 'client') {
            setIsClientMode(true);
            setActiveTab('viewer');
        } else if (tabParam && ['studio', 'viewer', 'settings', 'analytics', 'files', 'wallet'].includes(tabParam)) {
            setActiveTab(tabParam as any);
        }
    }, [searchParams]);

    // If in Client Mode, force viewer tab
    const handleModeToggle = () => {
        setIsClientMode(!isClientMode);
        if (!isClientMode) {
            setActiveTab('viewer'); // Switch to viewer when entering client mode
        } else {
            setActiveTab('studio'); // Switch back to studio when entering agency mode
        }
    };

    return (
        <SecureDashboard
            agencyId={id}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isClientMode={isClientMode}
            onToggleMode={handleModeToggle}
        >
            <div className="flex h-full gap-6">
                <div className="flex-1 h-full min-h-0">
                    {activeTab === 'studio' && <WatermarkStudio />}
                    {activeTab === 'viewer' && <SecureViewer />}
                    {activeTab === 'files' && <FileHistoryPanel />}
                    {activeTab === 'settings' && <DRMSettings />}
                    {activeTab === 'analytics' && <AgencyAnalytics />}
                    {activeTab === 'wallet' && (
                        <CreatorWallet
                            isAddMoneyOpen={isWalletModalOpen}
                            onToggleAddMoney={() => setIsWalletModalOpen(!isWalletModalOpen)}
                        />
                    )}
                </div>

                {/* AI Panel is now integrated into ClientDashboard or Agency Sidebar via SecureDashboard */}
                {/* Only showing explicit separate panel if strictly needed, but design has shifted */}
            </div>
        </SecureDashboard>
    );
}
