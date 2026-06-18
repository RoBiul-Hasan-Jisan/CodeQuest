import { auth } from './firebase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export class APIClient {
  static async getAuthToken(): Promise<string | null> {
    try {
      const user = auth.currentUser
      if (user) {
        return await user.getIdToken()
      }
      return null
    } catch (error) {
      console.error('[v0] Error getting auth token:', error)
      return null
    }
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const token = await this.getAuthToken()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[v0] API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  static async signup(uid: string, email: string, displayName: string) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ uid, email, displayName }),
    })
  }

  // User endpoints
  static async getProfile() {
    return this.request('/api/user/profile', {
      method: 'GET',
    })
  }

  static async updateProfile(data: any) {
    return this.request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}
