"use client";

import React from "react";
import SecureDashboard from "../../_components/SecureDashboard";

export default function ClientConnect() {
    return (
        <SecureDashboard
            agencyId="client-view"
            activeTab="viewer"
            onTabChange={() => { }}
            isClientMode={true}
            onToggleMode={() => { }}
        >
            {/* 
                SecureDashboard handles rendering ClientDashboard internally 
                when isClientMode is true. No children needed here. 
            */}
        </SecureDashboard>
    );
}
