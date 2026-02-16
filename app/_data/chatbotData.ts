export interface ChatResponse {
    keywords: string[];
    response: string;
    action?: string; // e.g., "open-pricing", "scroll-to-features"
}

export const chatbotKnowledgeBase: ChatResponse[] = [
    // Identity
    {
        keywords: ["who are you", "what is this", "bot", "ai", "hello", "hi"],
        response: "Hello! I'm the **TrustVaultX**. I'm here to explain our advanced security features, DRM technology, and how we protect your creative work. How can I help you today?"
    },
    // Core Value
    {
        keywords: ["what is creatorsecure", "what do you do", "purpose", "value"],
        response: "TrustVaultX is the **trust infrastructure for the AI era**. We protect creative work from theft, enforce fair payment through smart contracts, and generate immutable proof of ownership using blockchain technology."
    },
    // DRM - Screen Recording
    {
        keywords: ["record", "recording", "obs", "screen capture", "black screen"],
        response: "Our **Netflix-Grade DRM** detects screen recording software (like OBS or QuickTime) and instantly overlays a hardware-accelerated **black screen** to obscure the content. Audio may remain, but the visual IP is completely protected."
    },
    // DRM - Screenshots
    {
        keywords: ["screenshot", "print screen", "snipping tool", "capture"],
        response: "We prevent screenshots by blocking keyboard shortcuts (like `PrintScreen`, `Cmd+Shift+3`) and obfuscating the content if capture events are detected. For physical cameras (phone photos), our **Dynamic Watermarking** ensures any leak is traceable to the viewer's ID."
    },
    // DRM - Watermarking
    {
        keywords: ["watermark", "trace", "leak", "photo", "camera"],
        response: "We use **Dynamic Watermarking** that overlays the viewer's ID, IP address, and timestamp on the content. We also embed invisible **Forensic Watermarks** into the video stream that survive re-encoding, making any leak permanently traceable."
    },
    // Secure Zoom
    {
        keywords: ["zoom", "meeting", "call", "video conference"],
        response: "Our **Secure Zoom** feature is built for high-stakes meetings. It automatically records sessions for immutable proof, generates AI transcripts, and prevents participants from recording locally."
    },
    // Payments & Wallet
    {
        keywords: ["payment", "wallet", "crypto", "money", "escrow"],
        response: "Our **Universal Secure Wallet** handles both Fiat (USD) and Crypto (ETH/USDC). Payments are held in **Escrow Smart Contracts** and only released when milestones are verified, ensuring you get paid for your work."
    },
    // One-Step Tunneling
    {
        keywords: ["tunnel", "localhost", "share code", "deployment"],
        response: "With **One-Step Tunneling**, you can securely share your `localhost` projects with clients via an encrypted tunnel. They can view the live site with full DRM protection, but the source code never leaves your machine."
    },
    // Technical - Malware
    {
        keywords: ["malware", "virus", "scan", "download", "safety"],
        response: "Every file shared on TrustVaultX is scanned by our **VM-Based Malware Detection**. We detonate files in a sandboxed environment to watch for malicious behavior before allowing them to be downloaded."
    },
    // Bot Deception
    {
        keywords: ["bot", "scraper", "ai", "crawl", "gpt"],
        response: "We use **Bot Deception** technology. If an AI scraper visits your link, we serve them 'hallucinated' or scrambled data to poison their training set, rather than giving them your actual content."
    },
    // Comparison
    {
        keywords: ["google drive", "dropbox", "difference", "zoom vs"],
        response: "Tools like Google Drive and Zoom are built for *sharing*. TrustVaultX is built for *protection*. They don't block screen recordings, enforce smart contract payments, or provide forensic watermarking like we do."
    },
    // Default / Fallback (Handled in component logic, but good to have a generic entry)
    {
        keywords: ["help", "support", "contact"],
        response: "I can help explain our **DRM**, **Secure Payments**, **Tunneling**, or **Anti-Bot** features. What would you like to know more about?"
    }
];

export const defaultResponse = "I'm not sure about that specific detail yet. I can tell you about our **DRM Security**, **Secure Payments**, **Zoom Integration**, or **Malware Detection**. Could you rephrase your question?";
