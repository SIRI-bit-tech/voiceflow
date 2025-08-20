import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiClient } from '../core/services/api.client';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Logo and Title -->
        <div class="text-center">
          <div class="mx-auto h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-900">Create Account</h2>
          <p class="mt-2 text-sm text-gray-600">Join VoiceFlow and start creating with voice</p>
        </div>

        <!-- Registration Form -->
        <form class="mt-8 space-y-6" (ngSubmit)="register()" #registerForm="ngForm">
          <div class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                [(ngModel)]="userData.username"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Choose a username"
                [class.border-red-500]="showError() && !userData.username"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                [(ngModel)]="userData.email"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                [class.border-red-500]="showError() && !userData.email"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                [(ngModel)]="userData.password"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Create a password"
                [class.border-red-500]="showError() && !userData.password"
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
                [(ngModel)]="userData.confirmPassword"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm your password"
                [class.border-red-500]="showError() && !userData.confirmPassword"
              />
            </div>

            <div class="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                [(ngModel)]="userData.agreeTerms"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label for="agree-terms" class="ml-2 block text-sm text-gray-900">
                I agree to the 
                <a href="#" class="text-indigo-600 hover:text-indigo-500">Terms of Service</a>
                and 
                <a href="#" class="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
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
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span *ngIf="isLoading()" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isLoading() ? 'Creating Account...' : 'Create Account' }}
            </button>
          </div>

          <!-- Login Link -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              Already have an account? 
              <a routerLink="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in here
              </a>
            </p>
          </div>
        </form>

        <!-- Voice Features Preview -->
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Voice-First Features</h3>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex items-center">
              <svg class="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Voice-controlled content creation
            </div>
            <div class="flex items-center">
              <svg class="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              3D spatial audio navigation
            </div>
            <div class="flex items-center">
              <svg class="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Multi-language support
            </div>
            <div class="flex items-center">
              <svg class="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Real-time collaboration
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterPage {
  private router = inject(Router);
  private api = inject(ApiClient);
  
  userData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  };
  
  isLoading = signal(false);
  showError = signal(false);
  errorMessage = signal('');
  
  async register(): Promise<void> {
    // Validate form
    if (!this.userData.username || !this.userData.email || !this.userData.password || !this.userData.confirmPassword) {
      this.showError.set(true);
      this.errorMessage.set('Please fill in all required fields');
      return;
    }
    
    if (this.userData.password !== this.userData.confirmPassword) {
      this.showError.set(true);
      this.errorMessage.set('Passwords do not match');
      return;
    }
    
    if (this.userData.password.length < 8) {
      this.showError.set(true);
      this.errorMessage.set('Password must be at least 8 characters long');
      return;
    }
    
    if (!this.userData.agreeTerms) {
      this.showError.set(true);
      this.errorMessage.set('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    this.isLoading.set(true);
    this.showError.set(false);
    
    try {
      const response = await this.api.registerUser({
        username: this.userData.username,
        email: this.userData.email,
        password: this.userData.password
      });
      
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.router.navigate(['/dashboard']);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      this.showError.set(true);
      this.errorMessage.set(error.message || 'Registration failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
