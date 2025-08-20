import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiClient } from '../core/services/api.client';
import { WebsocketService } from '../core/services/websocket.service';

interface AnalyticsData {
  total_users: number;
  active_users: number;
  total_content: number;
  published_content: number;
  voice_commands: number;
  accuracy_rate: number;
  avg_latency_ms: number;
  system_status: string;
}

interface UserActivity {
  user_id: string;
  username: string;
  last_activity: string;
  role: string;
  content_count: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <!-- Header -->
      <header class="bg-red-600 text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center space-x-4">
              <h1 class="text-2xl font-bold">VoiceFlow Admin</h1>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span class="text-sm">Live</span>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm">Welcome, {{ adminName() }}</span>
              <button 
                class="px-4 py-2 bg-red-700 hover:bg-red-800 rounded transition-colors"
                (click)="logout()"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Real-time Analytics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Users</p>
                <p class="text-3xl font-bold text-gray-900">{{ analytics().total_users }}</p>
              </div>
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-sm text-green-600">+{{ analytics().active_users }} active</span>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Content</p>
                <p class="text-3xl font-bold text-gray-900">{{ analytics().total_content }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-sm text-green-600">{{ analytics().published_content }} published</span>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Voice Commands</p>
                <p class="text-3xl font-bold text-gray-900">{{ analytics().voice_commands }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                </svg>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-sm text-green-600">{{ (analytics().accuracy_rate * 100).toFixed(1) }}% accuracy</span>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">System Status</p>
                <p class="text-3xl font-bold text-gray-900">{{ analytics().system_status }}</p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-sm text-gray-600">{{ analytics().avg_latency_ms }}ms avg</span>
            </div>
          </div>
        </div>

        <!-- Real-time Activity and Controls -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Live User Activity -->
          <div class="bg-white rounded-lg shadow-md">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Live User Activity</h2>
            </div>
            <div class="p-6">
              <div class="space-y-4 max-h-96 overflow-y-auto">
                <div 
                  *ngFor="let user of activeUsers(); trackBy: trackByUserId" 
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-red-600">{{ user.username.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ user.username }}</p>
                      <p class="text-sm text-gray-500">{{ user.role }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-gray-600">{{ user.content_count }} items</p>
                    <p class="text-xs text-gray-400">{{ user.last_activity }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- System Controls -->
          <div class="bg-white rounded-lg shadow-md">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">System Controls</h2>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Voice Processing</span>
                <button 
                  class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  (click)="toggleVoiceProcessing()"
                >
                  {{ voiceProcessingEnabled() ? 'Disable' : 'Enable' }}
                </button>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">User Registration</span>
                <button 
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  (click)="toggleUserRegistration()"
                >
                  {{ userRegistrationEnabled() ? 'Disable' : 'Enable' }}
                </button>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">System Maintenance</span>
                <button 
                  class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                  (click)="toggleMaintenanceMode()"
                >
                  {{ maintenanceMode() ? 'Disable' : 'Enable' }}
                </button>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Backup System</span>
                <button 
                  class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  (click)="triggerBackup()"
                >
                  Backup Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="mt-8 bg-white rounded-lg shadow-md">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                class="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left"
                (click)="navigateToUserManagement()"
              >
                <div class="flex items-center space-x-3">
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                  <div>
                    <p class="font-medium text-gray-900">User Management</p>
                    <p class="text-sm text-gray-500">Manage users and permissions</p>
                  </div>
                </div>
              </button>
              
              <button 
                class="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                (click)="navigateToContentManagement()"
              >
                <div class="flex items-center space-x-3">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <div>
                    <p class="font-medium text-gray-900">Content Management</p>
                    <p class="text-sm text-gray-500">Review and manage content</p>
                  </div>
                </div>
              </button>
              
              <button 
                class="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
                (click)="navigateToAnalytics()"
              >
                <div class="flex items-center space-x-3">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <div>
                    <p class="font-medium text-gray-900">Analytics</p>
                    <p class="text-sm text-gray-500">Detailed analytics and reports</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class AdminDashboardPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private api = inject(ApiClient);
  private websocket = inject(WebsocketService);
  
  analytics = signal<AnalyticsData>({
    total_users: 0,
    active_users: 0,
    total_content: 0,
    published_content: 0,
    voice_commands: 0,
    accuracy_rate: 0,
    avg_latency_ms: 0,
    system_status: 'Unknown'
  });
  
  activeUsers = signal<UserActivity[]>([]);
  adminName = signal('Admin');
  voiceProcessingEnabled = signal(true);
  userRegistrationEnabled = signal(true);
  maintenanceMode = signal(false);
  
  private wsConnection: any;
  private updateInterval: any;
  
  ngOnInit(): void {
    this.loadAnalytics();
    this.loadActiveUsers();
    this.connectWebSocket();
    this.startRealTimeUpdates();
  }
  
  ngOnDestroy(): void {
    this.wsConnection?.unsubscribe();
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
  
  private async loadAnalytics(): Promise<void> {
    try {
      const [voiceAnalytics, userAnalytics, latency, systemHealth] = await Promise.all([
        this.api.getVoiceAnalytics(),
        this.api.getUserAnalytics(),
        this.api.getLatency(),
        this.api.getSystemHealth()
      ]);
      
      this.analytics.set({
        total_users: userAnalytics.total_users,
        active_users: userAnalytics.active_users,
        total_content: userAnalytics.total_content,
        published_content: userAnalytics.published_content,
        voice_commands: voiceAnalytics.total_commands,
        accuracy_rate: voiceAnalytics.accuracy_rate,
        avg_latency_ms: latency.avg_latency_ms,
        system_status: systemHealth.status
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }
  
  private async loadActiveUsers(): Promise<void> {
    try {
      const users = await this.api.getActiveUsers();
      this.activeUsers.set(users);
    } catch (error) {
      console.error('Failed to load active users:', error);
    }
  }
  
  private connectWebSocket(): void {
    this.wsConnection = this.websocket.connect('ws://localhost:8000/ws/admin').subscribe({
      next: (message) => this.handleAdminMessage(message),
      error: (error) => console.error('Admin WebSocket error:', error),
      complete: () => console.log('Admin WebSocket closed')
    });
  }
  
  private handleAdminMessage(message: string): void {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'analytics_update') {
        this.analytics.set(data.data);
      } else if (data.type === 'user_activity') {
        this.updateUserActivity(data.data);
      } else if (data.type === 'system_status') {
        this.analytics.update(current => ({ ...current, system_status: data.status }));
      }
    } catch (error) {
      console.error('Error parsing admin message:', error);
    }
  }
  
  private updateUserActivity(userData: UserActivity): void {
    this.activeUsers.update(users => {
      const existingIndex = users.findIndex(u => u.user_id === userData.user_id);
      if (existingIndex >= 0) {
        users[existingIndex] = userData;
      } else {
        users.unshift(userData);
      }
      return users.slice(0, 20); // Keep only last 20 users
    });
  }
  
  private startRealTimeUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.loadAnalytics();
      this.loadActiveUsers();
    }, 30000); // Update every 30 seconds
  }
  
  async toggleVoiceProcessing(): Promise<void> {
    try {
      await this.api.toggleVoiceProcessing();
      this.voiceProcessingEnabled.set(!this.voiceProcessingEnabled());
    } catch (error) {
      console.error('Failed to toggle voice processing:', error);
    }
  }
  
  async toggleUserRegistration(): Promise<void> {
    try {
      await this.api.toggleUserRegistration();
      this.userRegistrationEnabled.set(!this.userRegistrationEnabled());
    } catch (error) {
      console.error('Failed to toggle user registration:', error);
    }
  }
  
  async toggleMaintenanceMode(): Promise<void> {
    try {
      await this.api.toggleMaintenanceMode();
      this.maintenanceMode.set(!this.maintenanceMode());
    } catch (error) {
      console.error('Failed to toggle maintenance mode:', error);
    }
  }
  
  async triggerBackup(): Promise<void> {
    try {
      await this.api.triggerBackup();
      console.log('Backup triggered successfully');
    } catch (error) {
      console.error('Failed to trigger backup:', error);
    }
  }
  
  navigateToUserManagement(): void {
    this.router.navigate(['/admin/users']);
  }
  
  navigateToContentManagement(): void {
    this.router.navigate(['/admin/content']);
  }
  
  navigateToAnalytics(): void {
    this.router.navigate(['/admin/analytics']);
  }
  
  logout(): void {
    localStorage.removeItem('admin_token');
    this.router.navigate(['/admin/login']);
  }
  
  trackByUserId(index: number, user: UserActivity): string {
    return user.user_id;
  }
}
