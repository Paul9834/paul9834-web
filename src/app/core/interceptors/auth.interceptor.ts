import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  const apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');
  const isOwnApiRequest = req.url.startsWith(apiBaseUrl) || req.url.startsWith('/api');

  if (token && isOwnApiRequest) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req);
};
