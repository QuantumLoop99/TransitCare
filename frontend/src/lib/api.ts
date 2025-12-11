import { User, Complaint, DashboardStats, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('clerk-token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Complaint endpoints
  async getComplaints(filters?: Record<string, any>): Promise<ApiResponse<Complaint[]>> {
    const userEmail = localStorage.getItem("userEmail"); // store this at login
    const params = new URLSearchParams({
      ...(filters || {}),
      ...(userEmail ? { userEmail } : {}),
    }).toString();

    return this.request<Complaint[]>(`/complaints?${params}`);
  }

  async getComplaint(id: string): Promise<ApiResponse<Complaint>> {
    return this.request<Complaint>(`/complaints/${id}`);
  }

  async createComplaint(data: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Complaint>> {
    return this.request<Complaint>('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateComplaint(id: string, data: Partial<Complaint>): Promise<ApiResponse<Complaint>> {
    return this.request<Complaint>(`/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async prioritizeComplaint(id: string): Promise<ApiResponse<Complaint>> {
    return this.request<Complaint>(`/complaints/${id}/prioritize`, {
      method: 'POST',
    });
  }

  // User endpoints
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/users');
  }

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  // Reports endpoints
  async getReports(type: string, params?: Record<string, any>): Promise<ApiResponse<any>> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/reports/${type}${query}`);
  }
}

export const apiClient = new ApiClient();