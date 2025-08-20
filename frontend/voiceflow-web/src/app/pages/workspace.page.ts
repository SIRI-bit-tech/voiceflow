import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiClient } from '../core/services/api.client';

@Component({
  selector: 'app-workspace-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-900 text-white p-6">
      <h1 class="text-3xl font-bold mb-4">Workspace</h1>
      <p>Spatial navigation and content lists will appear here.</p>
    </div>
  `,
})
export class WorkspacePage {}
export class WorkspacePage {
  private route = inject(ActivatedRoute);
  private api = inject(ApiClient);
  items: any[] = [];

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id') || undefined;
    this.items = await this.api.listContent(id);
  }
}


