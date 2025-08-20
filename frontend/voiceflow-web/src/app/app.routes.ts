import { Routes } from '@angular/router';
import { LoginPage } from './pages/login.page';
import { RegisterPage } from './pages/register.page';
import { DashboardPage } from './pages/dashboard.page';
import { WorkspacePage } from './pages/workspace.page';
import { AdminLoginPage } from './pages/admin-login.page';
import { AdminRegisterPage } from './pages/admin-register.page';
import { AdminDashboardPage } from './pages/admin-dashboard.page';
import { authGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'dashboard', component: DashboardPage, canActivate: [authGuard] },
  { path: 'workspace/:id', component: WorkspacePage, canActivate: [authGuard] },
  
  // Admin routes
  { path: 'admin/login', component: AdminLoginPage },
  { path: 'admin/register', component: AdminRegisterPage },
  { path: 'admin/dashboard', component: AdminDashboardPage, canActivate: [AdminGuard] },
  { path: 'admin', redirectTo: '/admin/dashboard', pathMatch: 'full' },
];
