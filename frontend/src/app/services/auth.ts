import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://127.0.0.1:8080';

  currentUser = signal<any>(null);

  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      // For MVP, we'll just assume the token is valid and set a placeholder user
      // In a real app, you'd verify the token or fetch user profile
      this.currentUser.set({ token });
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    return this.http.post(`${this.apiUrl}/token`, formData).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.access_token);
        this.currentUser.set(response);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
