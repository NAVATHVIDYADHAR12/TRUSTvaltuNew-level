// Profile page type definitions

export interface User {
    _id: string;
    name: string;
    email: string;
    profilePic?: string;
    bio?: string;
    summary?: string;
    role?: string;
    profession?: string;
    skills?: string[];
    experience?: string;
    photoPosition?: 'top' | 'center' | 'bottom' | 'custom';
    socialLinks?: SocialLink[];
    posts?: Post[];
    certificates?: Certificate[];
    badges?: Badge[];
    teams?: Team[];
    followers?: string[];
    following?: string[];
}

export interface Post {
    id: string;
    caption: string;
    imageUrl?: string;
    createdAt: string;
    likes?: string[];
    userId: string;
}

export interface Certificate {
    id: string;
    title: string;
    issuer: string;
    date: string;
    fileUrl?: string;
}

export interface Badge {
    id: string;
    name: string;
    imageUrl: string;
    date: string;
}

export interface SocialLink {
    platform: 'github' | 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'youtube' | 'website';
    url: string;
}

export interface Team {
    id: string;
    name: string;
    description?: string;
    leaderId: string;
    leaderName?: string;
    members?: TeamMember[];
}

export interface TeamMember {
    userId: string;
    name: string;
    profilePic?: string;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
    type: 'group' | 'dm';
}
