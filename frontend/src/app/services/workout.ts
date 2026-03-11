import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Exercise {
    id?: number;
    name: string;
    target_sets: number;
    target_reps: number;
    target_weight?: number;
    muscle_group?: string;
    order_index?: number;
    video_url?: string;
}

export interface WorkoutPlan {
    id?: number;
    name: string;
    exercises: Exercise[];
    created_at?: string;
}

export interface SetLog {
    exercise_id: number;
    reps: number;
    weight: number;
    rpe?: number;
    is_pr?: boolean;
    notes?: string;
}

export interface WorkoutSession {
    id?: number;
    plan_id: number;
    date?: string;
    start_time?: string;
    end_time?: string;
    body_weight?: number;
    sleep_quality?: number;
    energy_level?: number;
    has_pain?: boolean;
    rating?: number;
    notes?: string;
    logs: SetLog[];
}

@Injectable({
    providedIn: 'root'
})
export class WorkoutService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    plans = signal<WorkoutPlan[]>([]);
    sessions = signal<WorkoutSession[]>([]);

    fetchPlans(): Observable<WorkoutPlan[]> {
        return this.http.get<WorkoutPlan[]>(`${this.apiUrl}/workout-plans`).pipe(
            tap(plans => this.plans.set(plans))
        );
    }

    createPlan(plan: WorkoutPlan): Observable<WorkoutPlan> {
        return this.http.post<WorkoutPlan>(`${this.apiUrl}/workout-plans`, plan).pipe(
            tap(newPlan => {
                this.plans.update(plans => [...plans, newPlan]);
            })
        );
    }

    updatePlan(id: number, plan: WorkoutPlan): Observable<WorkoutPlan> {
        return this.http.put<WorkoutPlan>(`${this.apiUrl}/workout-plans/${id}`, plan).pipe(
            tap(updatedPlan => {
                this.plans.update(plans => plans.map(p => p.id === id ? updatedPlan : p));
            })
        );
    }

    deletePlan(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/workout-plans/${id}`).pipe(
            tap(() => {
                this.plans.update(plans => plans.filter(p => p.id !== id));
            })
        );
    }

    fetchSessions(): Observable<WorkoutSession[]> {
        return this.http.get<WorkoutSession[]>(`${this.apiUrl}/workout-sessions`).pipe(
            tap(sessions => this.sessions.set(sessions))
        );
    }

    logSession(session: WorkoutSession): Observable<WorkoutSession> {
        return this.http.post<WorkoutSession>(`${this.apiUrl}/workout-sessions`, session).pipe(
            tap(newSession => {
                this.sessions.update(sessions => [...sessions, newSession]);
            })
        );
    }

    getExerciseHistory(exerciseId: number): Observable<SetLog[]> {
        return this.http.get<SetLog[]>(`${this.apiUrl}/exercises/${exerciseId}/history`);
    }
}
