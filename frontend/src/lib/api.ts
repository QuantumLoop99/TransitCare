import { User, Complaint, DashboardStats, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    };

    const token = localStorage.getItem('clerk-token');
    if (token) {
      config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
    }

    try {
      const resp = await fetch(url, config);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || `HTTP ${resp.status}`);
      return data;
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  // 🔹 Complaints
  getComplaints(filters?: Record<string, any>) {
    const params = new URLSearchParams(filters || {}).toString();
    return this.request<Complaint[]>(`/complaints${params ? `?${params}` : ''}`);
  }

  getComplaint(id: string) {
    return this.request<Complaint>(`/complaints/${id}`);
  }

  createComplaint(data: Omit<Complaint, '_id' | 'createdAt' | 'updatedAt'>) {
    return this.request<Complaint>('/complaints', { method: 'POST', body: JSON.stringify(data) });
  }

  updateComplaint(id: string, data: Partial<Complaint>) {
    return this.request<Complaint>(`/complaints/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  prioritizeComplaint(id: string) {
    return this.request<Complaint>(`/complaints/${id}/prioritize`, { method: 'POST' });
  }

  // 🔹 Complaint Chat (New)
  getComplaintMessages(complaintId: string) {
    return this.request<any[]>(`/complaints/${complaintId}/messages`);
  }

  postComplaintMessage(
    complaintId: string,
    data: { sender: 'passenger' | 'officer' | 'admin'; senderId?: string; message: string }
  ) {
    return this.request<any>(`/complaints/${complaintId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 🔹 Users
  getUsers(filters?: Record<string, any>) {
    const q = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request<User[]>(`/users${q}`);
  }

  createUser(data: Omit<User, '_id' | 'createdAt' | 'updatedAt'>) {
    return this.request<User>('/users', { method: 'POST', body: JSON.stringify(data) });
  }

  updateUser(id: string, data: Partial<User>) {
    return this.request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  deleteUser(id: string) {
    return this.request<{ success: boolean }>(`/users/${id}`, { method: 'DELETE' });
  }

  // 🔹 Dashboard
  getDashboardStats(params?: Record<string, any>) {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<DashboardStats>(`/dashboard/stats${q}`);
  }

  // 🔹 Reports
  getReports(type: string, params?: Record<string, any>) {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/reports/${type}${q}`);
  }
}

export const apiClient = new ApiClient();
