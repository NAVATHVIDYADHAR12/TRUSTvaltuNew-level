import './globals.css'
import type { Metadata } from 'next'
import GlobalDRMProtection from './_components/GlobalDRMProtection'

import CursorGlow from './_components/CursorGlow'

export const metadata: Metadata = {
    title: 'TrustVaultX - Secure Content Platform',
    description: 'Professional DRM-protected content delivery platform',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <GlobalDRMProtection />
                <CursorGlow />
                {children}
            </body>
        </html>
    )
}
