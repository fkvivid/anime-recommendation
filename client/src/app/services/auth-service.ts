import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  SignInRequest,
  SignUpRequest,
  AuthResponse,
  User,
} from '../types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _accessToken = signal<string | null>(
    localStorage.getItem('access_token')
  );
  private readonly _refreshToken = signal<string | null>(
    localStorage.getItem('refresh_token')
  );
  private readonly _currentUser = signal<User | null>(
    JSON.parse(localStorage.getItem('user') ?? 'null') as User | null
  );

  readonly accessToken = this._accessToken.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._accessToken());

  signUp(payload: SignUpRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}auth/signup`, payload)
      .pipe(tap((res) => this.persist(res)));
  }

  signIn(payload: SignInRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}auth/signin`, payload)
      .pipe(tap((res) => this.persist(res)));
  }

  refreshAccessToken(): Observable<{ accessToken: string }> {
    const refreshToken = this._refreshToken();
    if (!refreshToken) {
      this.signOut();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<{ accessToken: string }>(`${environment.apiUrl}auth/refresh`, {
        refreshToken
      })
      .pipe(
        tap((res) => {
          this._accessToken.set(res.accessToken);
          localStorage.setItem('access_token', res.accessToken);
        }),
        catchError((err) => {
          this.signOut();
          return throwError(() => err);
        })
      );
  }

  signOut(): void {
    this.http.post(`${environment.apiUrl}auth/logout`, {}).subscribe()
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._currentUser.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    void this.router.navigate(['/login']);
  }

  private persist(res: AuthResponse): void {
    this._accessToken.set(res.accessToken);
    this._refreshToken.set(res.refreshToken || null);
    this._currentUser.set(res.user);
    localStorage.setItem('access_token', res.accessToken);
    if (res.refreshToken) {
      localStorage.setItem('refresh_token', res.refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(res.user));
  }
}