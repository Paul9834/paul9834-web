import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'blog_jwt';
  private token = signal<string | null>(null);

  isAuthenticated = computed(() => !!this.token());

  constructor(private http: HttpClient) {}

  login(password: string): Observable<boolean> {
    return this.http.post<{ token: string }>('/api/auth/token', { password }).pipe(
      tap((res) => this.token.set(res.token)),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  getToken() {
    return this.token();
  }

  logout() {
    this.token.set(null);
  }
}
