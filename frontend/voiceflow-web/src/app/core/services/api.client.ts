import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  baseUrl = 'http://localhost:8000';
  private get authHeaders(): Record<string, string> {
    const t = localStorage.getItem('token');
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
}


