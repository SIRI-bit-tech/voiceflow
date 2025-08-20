import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/onboarding/voice-onboarding.component').then(m => m.VoiceOnboardingComponent)
  },
  { path: 'login', loadComponent: () => import('./pages/login.page').then(m => m.LoginPage) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./pages/dashboard.page').then(m => m.DashboardPage) },
  { path: 'workspace/:id', canActivate: [authGuard], loadComponent: () => import('./pages/workspace.page').then(m => m.WorkspacePage) },
];

export const routes: Routes = [];
