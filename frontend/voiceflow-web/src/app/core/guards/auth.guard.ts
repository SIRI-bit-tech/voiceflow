import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    inject(Router).navigateByUrl('/login');
    return false;
  }
  return true;
};


