import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface UserProfile {
    id?: number;
    height_cm: number | null;
    weight_kg: number | null;
    age: number | null;
    gender: string | null;
    activity_level: string | null;
    goal: string | null;
    tdee?: number;
    calorie_target?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private http = inject(HttpClient);
    private apiUrl = 'http://127.0.0.1:8080';

    profile = signal<UserProfile | null>(null);

    fetchProfile(): Observable<UserProfile> {
        return this.http.get<UserProfile>(`${this.apiUrl}/profile`).pipe(
            tap(profile => this.profile.set(profile))
        );
    }

    updateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
        return this.http.put<UserProfile>(`${this.apiUrl}/profile`, profile).pipe(
            tap(updated => this.profile.set(updated))
        );
    }

    calculateBMI(weight: number, height: number): number {
        if (!weight || !height) return 0;
        const heightMeters = height / 100;
        return Number((weight / (heightMeters * heightMeters)).toFixed(1));
    }
}
