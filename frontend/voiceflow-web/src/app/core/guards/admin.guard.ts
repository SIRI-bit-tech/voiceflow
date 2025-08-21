import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';

export const AdminGuard = () => {
  const router = inject(Router);
  
  // Check if admin token exists
  const adminToken = localStorage.getItem('admin_token');
  if (!adminToken) {
    router.navigate(['/admin/login']);
    return false;
  }
  
  // For now, just check if token exists
  // In a real implementation, you might want to validate the token
  return true;
};
