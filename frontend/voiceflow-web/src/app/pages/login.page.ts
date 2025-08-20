import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiClient } from '../core/services/api.client';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-900 text-white grid place-items-center p-6">
      <form (ngSubmit)="submit()" class="space-y-4 w-full max-w-sm">
        <h2 class="text-2xl font-bold">Login</h2>
        <input class="w-full p-2 text-black" [(ngModel)]="username" name="username" placeholder="Username" />
        <input class="w-full p-2 text-black" [(ngModel)]="password" name="password" placeholder="Password" type="password" />
        <button class="w-full bg-indigo-600 p-2 rounded" type="submit">Sign in</button>
      </form>
    </div>
  `,
})
export class LoginPage {
  private api = inject(ApiClient);
  private router = inject(Router);
  username = '';
  password = '';

  async submit(): Promise<void> {
    const res = await fetch(`${this.api.baseUrl}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: this.username, password: this.password })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      this.router.navigateByUrl('/dashboard');
    }
  }
}


