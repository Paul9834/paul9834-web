import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/auth`;
  private readonly tokenStorageKey = 'kp_portfolio_admin_token';
  private token = signal<string | null>(this.getStoredToken());

  isAuthenticated = computed(() => !!this.token());

  constructor(private http: HttpClient) {}

  login(password: string): Observable<boolean> {
    return this.http.post<{ token: string }>(`${this.baseUrl}/token`, { password }).pipe(
      tap((res) => this.persistToken(res.token)),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  getToken() {
    return this.token();
  }

  logout() {
    this.clearStoredToken();
    this.token.set(null);
  }

  private persistToken(token: string): void {
    this.token.set(token);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.tokenStorageKey, token);
    }
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(this.tokenStorageKey);
  }

  private clearStoredToken(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(this.tokenStorageKey);
    }
  }
}
