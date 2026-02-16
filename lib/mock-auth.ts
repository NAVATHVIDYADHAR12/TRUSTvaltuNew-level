// Mock authentication for standalone app
// This replaces next-auth functionality

export const mockSession = {
    user: {
        id: 'demo-user-1',
        name: 'Demo User',
        email: 'demo@example.com',
        image: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
        profilePic: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
        bio: 'Demo user for testing',
        role: 'Developer'
    }
};

export function useSession() {
    return { data: mockSession, status: 'authenticated' };
}

// Update type definition if needed, but for now just return the object
export async function signIn(provider?: string, options?: any) {
    console.log('Mock signIn called:', provider, options);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check credentials (mock logic)
    // For now, accept ANY credentials to allow easy access
    // You can enforce specific emails if needed:
    // if (options?.email === 'demo@example.com' && options?.password === 'password') ...

    return {
        ok: true,
        error: null,
        status: 200,
        url: null
    };
}

export function signOut() {
    console.log('Mock signOut called');
    alert('Signed out successfully! (Mock)');
}
