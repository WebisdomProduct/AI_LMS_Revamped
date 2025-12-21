
export interface User {
    id: string;
    email: string;
    full_name?: string;
    role?: 'teacher' | 'student' | 'admin';
    avatar_url?: string;
}

export interface Session {
    access_token: string;
    user: User;
}
