import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  baseUrl = 'http://localhost:8000';
  private get authHeaders(): Record<string, string> {
    const t = localStorage.getItem('token');
    return t ? { Authorization: `Bearer ${t}` } : {};
  }
  
  private get adminAuthHeaders(): Record<string, string> {
    const t = localStorage.getItem('admin_token');
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  async health(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/health`);
    return res.json();
  }

  async tts(text: string, lang = 'en'): Promise<{ file_path: string }> {
    const res = await fetch(`${this.baseUrl}/api/voice/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders },
      body: JSON.stringify({ text, lang }),
    });
    return res.json();
  }

  async listContent(workspaceId?: string): Promise<any[]> {
    const url = new URL(`${this.baseUrl}/api/content`);
    if (workspaceId) url.searchParams.set('workspace_id', workspaceId);
    const res = await fetch(url.toString(), { headers: { ...this.authHeaders } });
    return res.json();
  }

  async publishContent(contentId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/content/${contentId}/publish`, {
      method: 'POST',
      headers: { ...this.authHeaders },
    });
    return res.json();
  }

  // User Authentication
  async registerUser(userData: { username: string; email: string; password: string }): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  }

  async loginUser(credentials: { username: string; password: string }): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  }

  // Admin Authentication
  async adminLogin(credentials: { username: string; password: string; adminCode: string }): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  }

  async adminRegister(adminData: { username: string; password: string; adminCode: string; email: string }): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/admin/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData),
    });
    return res.json();
  }

  // Admin Analytics
  async getVoiceAnalytics(days: number = 7): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/admin/analytics/voice?days=${days}`, {
      headers: { ...this.adminAuthHeaders },
    });
    return res.json();
  }

  async getUserAnalytics(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/admin/analytics/users`, {
      headers: { ...this.adminAuthHeaders },
    });
    return res.json();
  }

  async getLatency(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/admin/latency`, {
      headers: { ...this.adminAuthHeaders },
    });
    return res.json();
  }

  async getSystemHealth(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/admin/system/health`, {
      headers: { ...this.adminAuthHeaders },
    });
    return res.json();
  }

  async getActiveUsers(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/api/admin/users/active`, {
      headers: { ...this.adminAuthHeaders },
    });
    return res.json();
  }

  // Admin System Controls
  async toggleVoiceProcessing(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/admin/system/voice-processing`, {
      method: 'POST',
      headers: { ...this.adminAuthHeaders },
    });
    return res.json();
  }

  async toggleUserRegistration(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/admin/system/user-registration`, {
      method: 'POST',
      headers: { ...this.adminAuthHeaders },
    });
    return res.json();
  }

  async toggleMaintenanceMode(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/admin/system/maintenance`, {
      method: 'POST',
      headers: { ...this.adminAuthHeaders },
    });
    return res.json();
  }

  async triggerBackup(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/admin/system/backup`, {
      method: 'POST',
      headers: { ...this.adminAuthHeaders },
    });
    return res.json();
  }

  // Admin User Management
  async getAllUsers(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/api/admin/users`, {
      headers: { ...this.adminAuthHeaders },
    });
    return res.json();
  }

  async updateUserRole(userId: string, role: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.adminAuthHeaders },
      body: JSON.stringify({ role }),
    });
    return res.json();
  }

  async deleteUser(userId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { ...this.adminAuthHeaders },
    });
    return res.json();
  }

  // Admin Content Management
  async getAllContent(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/api/admin/content`, {
      headers: { ...this.adminAuthHeaders },
    });
    return res.json();
  }

  async approveContent(contentId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/admin/content/${contentId}/approve`, {
      method: 'POST',
      headers: { ...this.adminAuthHeaders },
    });
    return res.json();
  }

  async rejectContent(contentId: string, reason: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/admin/content/${contentId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.adminAuthHeaders },
      body: JSON.stringify({ reason }),
    });
    return res.json();
  }
}


