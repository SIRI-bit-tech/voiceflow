import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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


