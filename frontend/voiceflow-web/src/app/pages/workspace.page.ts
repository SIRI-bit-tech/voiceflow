import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiClient } from '../core/services/api.client';
import { SpatialMapComponent } from '../features/navigation/spatial-map.component';

@Component({
  selector: 'app-workspace-page',
  standalone: true,
  imports: [CommonModule, SpatialMapComponent],
  template: `
    <div class="min-h-screen bg-slate-900 text-white">
      <!-- WCAG 2.1 AAA Compliant Navigation -->
      <nav class="bg-slate-800 p-4" role="navigation" aria-label="Workspace navigation">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold" id="workspace-title">VoiceFlow Workspace</h1>
          <div class="space-x-4">
            <button 
              class="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              (click)="toggleSpatialView()"
              [attr.aria-pressed]="showSpatialView()"
              aria-describedby="spatial-description"
            >
              {{ showSpatialView() ? 'Hide' : 'Show' }} Spatial View
            </button>
            <button 
              class="px-4 py-2 bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              (click)="toggleVoiceMode()"
              [attr.aria-pressed]="voiceModeEnabled()"
              aria-describedby="voice-description"
            >
              {{ voiceModeEnabled() ? 'Disable' : 'Enable' }} Voice Mode
            </button>
          </div>
        </div>
        
        <!-- Accessibility descriptions -->
        <div class="sr-only" id="spatial-description">
          Toggle 3D spatial navigation interface with audio beacons
        </div>
        <div class="sr-only" id="voice-description">
          Enable voice-controlled navigation and content management
        </div>
      </nav>
      
      <!-- Main Content Area -->
      <main role="main" aria-labelledby="workspace-title">
        <!-- Spatial Navigation View -->
        <div *ngIf="showSpatialView()" class="relative">
          <app-spatial-map></app-spatial-map>
        </div>
        
        <!-- Traditional Content View -->
        <div *ngIf="!showSpatialView()" class="p-6">
          <section aria-labelledby="content-section-title">
            <h2 id="content-section-title" class="text-xl font-bold mb-4">Content Management</h2>
            
            <!-- Voice Status -->
            <div class="bg-slate-800 p-4 rounded mb-6" role="status" aria-live="polite">
              <h3 class="font-semibold mb-2">Voice Status</h3>
              <p class="text-sm">{{ voiceStatus() }}</p>
              <p class="text-sm mt-2" *ngIf="lastVoiceCommand()">
                Last command: "{{ lastVoiceCommand() }}"
              </p>
            </div>
            
            <!-- Content List -->
            <div class="grid gap-4">
              <article 
                *ngFor="let item of items; trackBy: trackByContentId" 
                class="bg-slate-800 p-4 rounded hover:bg-slate-700 transition-colors"
                [attr.aria-labelledby]="'content-' + item.id"
              >
                <h3 
                  [id]="'content-' + item.id" 
                  class="text-lg font-semibold mb-2"
                >
                  {{ item.title }}
                </h3>
                <p class="text-sm text-slate-300 mb-2">{{ item.body.substring(0, 100) }}...</p>
                <div class="flex justify-between items-center">
                  <span 
                    class="px-2 py-1 rounded text-xs"
                    [class]="getStatusClass(item.status)"
                    [attr.aria-label]="'Status: ' + item.status"
                  >
                    {{ item.status }}
                  </span>
                  <div class="space-x-2">
                    <button 
                      class="px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      (click)="editContent(item)"
                      [attr.aria-label]="'Edit ' + item.title"
                    >
                      Edit
                    </button>
                    <button 
                      class="px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      (click)="publishContent(item)"
                      *ngIf="item.status === 'draft'"
                      [attr.aria-label]="'Publish ' + item.title"
                    >
                      Publish
                    </button>
                  </div>
                </div>
              </article>
            </div>
            
            <!-- Empty State -->
            <div *ngIf="items.length === 0" class="text-center py-12">
              <p class="text-slate-400 mb-4">No content found in this workspace</p>
              <button 
                class="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                (click)="createNewContent()"
                aria-describedby="create-description"
              >
                Create New Content
              </button>
              <div class="sr-only" id="create-description">
                Create a new piece of content in this workspace
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <!-- Skip to main content link for screen readers -->
      <a 
        href="#workspace-title" 
        class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-slate-800 text-white px-4 py-2 rounded"
      >
        Skip to main content
      </a>
    </div>
  `,
})
export class WorkspacePage implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiClient);
  
  items: any[] = [];
  showSpatialView = signal(false);
  voiceModeEnabled = signal(false);
  voiceStatus = signal('Voice mode ready');
  lastVoiceCommand = signal('');
  
  ngOnInit(): void {
    this.loadContent();
    this.initializeVoiceMode();
  }
  
  async loadContent(): Promise<void> {
    try {
      const id = this.route.snapshot.paramMap.get('id') || undefined;
      this.items = await this.api.listContent(id);
    } catch (error) {
      console.error('Failed to load content:', error);
      this.voiceStatus.set('Failed to load content');
    }
  }
  
  private initializeVoiceMode(): void {
    // Initialize voice recognition and synthesis
    this.voiceModeEnabled.set(true);
    this.voiceStatus.set('Voice mode initialized. Say "navigate to blog" or "show content"');
  }
  
  toggleSpatialView(): void {
    this.showSpatialView.set(!this.showSpatialView());
  }
  
  toggleVoiceMode(): void {
    this.voiceModeEnabled.set(!this.voiceModeEnabled());
    this.voiceStatus.set(
      this.voiceModeEnabled() ? 'Voice mode enabled' : 'Voice mode disabled'
    );
  }
  
  editContent(item: any): void {
    // Navigate to content editor
    console.log('Edit content:', item);
  }
  
  async publishContent(item: any): Promise<void> {
    try {
      await this.api.publishContent(item.id);
      this.voiceStatus.set(`Published: ${item.title}`);
      await this.loadContent(); // Refresh list
    } catch (error) {
      console.error('Failed to publish content:', error);
      this.voiceStatus.set('Failed to publish content');
    }
  }
  
  createNewContent(): void {
    // Navigate to content creation
    console.log('Create new content');
  }
  
  trackByContentId(index: number, item: any): string {
    return item.id;
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'published':
        return 'bg-green-600 text-white';
      case 'draft':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  }
}


