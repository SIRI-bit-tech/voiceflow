import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiClient } from '../core/services/api.client';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Logo and Title -->
        <div class="text-center">
          <div class="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-900">Admin Registration</h2>
          <p class="mt-2 text-sm text-gray-600">Create a new admin account for VoiceFlow</p>
        </div>

        <!-- Registration Form -->
        <form class="mt-8 space-y-6" (ngSubmit)="register()" #registerForm="ngForm">
          <div class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">
                Admin Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                [(ngModel)]="adminData.username"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Choose admin username"
                [class.border-red-500]="showError() && !adminData.username"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Admin Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                [(ngModel)]="adminData.email"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Enter admin email"
                [class.border-red-500]="showError() && !adminData.email"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Admin Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                [(ngModel)]="adminData.password"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Create admin password"
                [class.border-red-500]="showError() && !adminData.password"
              />
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                [(ngModel)]="adminData.confirmPassword"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Confirm admin password"
                [class.border-red-500]="showError() && !adminData.confirmPassword"
              />
            </div>

            <div>
              <label for="adminCode" class="block text-sm font-medium text-gray-700">
                Admin Security Code
              </label>
              <input
                id="adminCode"
                name="adminCode"
                type="text"
                required
                [(ngModel)]="adminData.adminCode"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Enter admin security code"
                [class.border-red-500]="showError() && !adminData.adminCode"
              />
              <p class="mt-1 text-xs text-gray-500">
                This code is required for admin registration and should be kept secure.
              </p>
            </div>

            <div class="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                [(ngModel)]="adminData.agreeTerms"
                class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label for="agree-terms" class="ml-2 block text-sm text-gray-900">
                I understand that I will have administrative privileges and agree to use them responsibly
              </label>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="showError()" class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Registration Failed</h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{ errorMessage() }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              [disabled]="isLoading()"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span *ngIf="isLoading()" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isLoading() ? 'Creating Admin Account...' : 'Create Admin Account' }}
            </button>
          </div>

          <!-- Login Link -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              Already have an admin account? 
              <a routerLink="/admin/login" class="font-medium text-red-600 hover:text-red-500">
                Sign in here
              </a>
            </p>
          </div>
        </form>

        <!-- Admin Privileges Notice -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">Admin Privileges</h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>Admin accounts have full system access including user management, system controls, and analytics. Use these privileges responsibly.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Features -->
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Admin Capabilities</h3>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex items-center">
              <svg class="h-4 w-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              System monitoring and analytics
            </div>
            <div class="flex items-center">
              <svg class="h-4 w-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              User management and permissions
            </div>
            <div class="flex items-center">
              <svg class="h-4 w-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              Content moderation and approval
            </div>
            <div class="flex items-center">
              <svg class="h-4 w-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              System configuration and controls
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminRegisterPage {
  private router = inject(Router);
  private api = inject(ApiClient);
  
  adminData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: '',
    agreeTerms: false
  };
  
  isLoading = signal(false);
  showError = signal(false);
  errorMessage = signal('');
  
  async register(): Promise<void> {
    // Validate form
    if (!this.adminData.username || !this.adminData.email || !this.adminData.password || !this.adminData.confirmPassword || !this.adminData.adminCode) {
      this.showError.set(true);
      this.errorMessage.set('Please fill in all required fields');
      return;
    }
    
    if (this.adminData.password !== this.adminData.confirmPassword) {
      this.showError.set(true);
      this.errorMessage.set('Passwords do not match');
      return;
    }
    
    if (this.adminData.password.length < 8) {
      this.showError.set(true);
      this.errorMessage.set('Password must be at least 8 characters long');
      return;
    }
    
    if (!this.adminData.agreeTerms) {
      this.showError.set(true);
      this.errorMessage.set('Please agree to use admin privileges responsibly');
      return;
    }
    
    this.isLoading.set(true);
    this.showError.set(false);
    
    try {
      const response = await this.api.adminRegister({
        username: this.adminData.username,
        email: this.adminData.email,
        password: this.adminData.password,
        adminCode: this.adminData.adminCode
      });
      
      if (response.id) {
        // Registration successful, redirect to admin login
        this.router.navigate(['/admin/login']);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      this.showError.set(true);
      this.errorMessage.set(error.message || 'Admin registration failed. Please check your security code and try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
