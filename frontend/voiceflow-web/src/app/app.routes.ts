import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/onboarding/voice-onboarding.component').then(m => m.VoiceOnboardingComponent)
  },
  { path: 'login', loadComponent: () => import('./pages/login.page').then(m => m.LoginPage) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard.page').then(m => m.DashboardPage) },
  { path: 'workspace/:id', loadComponent: () => import('./pages/workspace.page').then(m => m.WorkspacePage) },
];

export const routes: Routes = [];
