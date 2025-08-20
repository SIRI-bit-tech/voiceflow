import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiClient } from '../core/services/api.client';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-900 text-white p-6">
      <h1 class="text-3xl font-bold mb-4">Dashboard</h1>
      <pre class="bg-slate-800 p-4 rounded">{{ health | json }}</pre>
    </div>
  `,
})
export class DashboardPage {
  private api = inject(ApiClient);
  health: any = {};

  async ngOnInit(): Promise<void> {
    this.health = await this.api.health();
  }
}


