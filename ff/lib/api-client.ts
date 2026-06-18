import { auth } from './firebase';

class APIClientClass {
    private async getAuthToken(): Promise<string | null> {
        try {
            const user = auth.currentUser;
            if (!user) {
                console.warn('No authenticated user found');
                return null;
            }
            // Force refresh token to ensure it's valid
            const token = await user.getIdToken(true);
            console.log('Got auth token for user:', user.email);
            return token;
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    }

    private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
        const token = await this.getAuthToken();
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log(`Making ${options.method || 'GET'} request to ${endpoint} with auth`);
        } else {
            console.warn(`No token available for ${endpoint}`);
        }

        try {
            const response = await fetch(`/api${endpoint}`, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                console.error(`API error ${response.status}:`, data);
                throw new Error(data.error || `API request failed with status ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API request error for ${endpoint}:`, error);
            throw error;
        }
    }

    async signup(uid: string, email: string, displayName: string) {
        try {
            const result = await this.fetchWithAuth('/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ uid, email, displayName }),
            });
            return result;
        } catch (error) {
            console.error('Signup API error:', error);
            throw error;
        }
    }

    async getProfile() {
        try {
            const result = await this.fetchWithAuth('/user/profile', {
                method: 'GET',
            });
            return result;
        } catch (error) {
            console.error('Get profile API error:', error);
            throw error;
        }
    }

    async updateProfile(data: any) {
        try {
            const result = await this.fetchWithAuth('/user/profile', {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            return result;
        } catch (error) {
            console.error('Update profile API error:', error);
            throw error;
        }
    }
}

export const APIClient = new APIClientClass();