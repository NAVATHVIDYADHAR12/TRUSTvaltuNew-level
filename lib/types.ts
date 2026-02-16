export interface Certificate {
    id: string;
    title: string;
    issuer: string;
    date: string;
    fileUrl?: string; // For the uploaded file
    description?: string;
    // Social Stats
    likes?: number;
    comments?: number;
    isLiked?: boolean;
    commentsList?: { user: string; text: string; date: string }[];
}

export interface Badge {
    id: string;
    name: string;
    imageUrl: string;
    date: string;
    description?: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    password?: string;
    role: string;
    createdAt?: string;
    // Profile Fields
    profilePic?: string; // Base64 or URL
    bio?: string;
    summary?: string; // "Summarize about the person"

    // Social Fields
    posts?: Post[];
    followers?: string[]; // User IDs
    following?: string[]; // User IDs

    certificates?: Certificate[];
    badges?: Badge[];

    // Extended Profile
    socialLinks?: SocialLink[];
    profession?: 'Student' | 'Mentor' | 'Founder' | 'Working Professional' | 'Other';
    skills?: string[];
    experience?: string; // Years or description
    photoPosition?: 'center' | 'top' | 'bottom';
    teams?: Team[];
}

export interface SocialLink {
    platform: 'linkedin' | 'github' | 'instagram' | 'twitter' | 'facebook' | 'youtube' | 'website';
    url: string;
}

export interface Post {
    id: string;
    userId: string;
    imageUrl?: string;
    caption: string;
    likes: string[]; // User IDs
    comments: Comment[];
    createdAt: string;
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    text: string;
    createdAt: string;
}

export interface Team {
    id: string;
    name: string;
    description?: string;
    leaderId: string;
    leaderName: string;
    members: TeamMember[];
    createdAt: string;
    category?: string; // e.g., 'freelancer', 'student_agency'
}

export interface TeamMember {
    userId: string;
    name: string;
    role: string; // e.g., 'Developer', 'Designer'
    joinedAt: string;
    profilePic?: string;
}

export interface SearchProfile {
    id: string; // Unique ID for this search entry
    userId: string; // Link to the registered user
    name: string;
    role: string;
    skills: string[];
    rating: number;
    hourlyRate?: string;
    image: string;
    type: 'client' | 'freelancer' | 'student_agency' | 'industrial_agency';
    verified: boolean;
    bio?: string; // Short description
    createdAt: string;
}

export interface ChatMessage {
    id: string;
    teamId: string;
    senderId: string;
    senderName: string;
    senderImage?: string;
    content: string;
    type: 'group' | 'dm';
    recipientId?: string; // For DMs
    timestamp: string;
}
