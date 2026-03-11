import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface FoodLog {
    id?: number;
    food_name: string;
    grams: number;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    logged_at?: string;
}

@Injectable({
    providedIn: 'root'
})
export class FoodService {
    private http = inject(HttpClient);
    private apiUrl = 'http://127.0.0.1:8080';

    logs = signal<FoodLog[]>([]);

    fetchLogs(date?: string): Observable<FoodLog[]> {
        const url = date ? `${this.apiUrl}/food-logs?date=${date}` : `${this.apiUrl}/food-logs`;
        return this.http.get<FoodLog[]>(url).pipe(
            tap(logs => this.logs.set(logs))
        );
    }

    logFood(food: FoodLog): Observable<FoodLog> {
        return this.http.post<FoodLog>(`${this.apiUrl}/food-logs`, food).pipe(
            tap(newLog => this.logs.update(logs => [...logs, newLog]))
        );
    }

    deleteLog(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/food-logs/${id}`).pipe(
            tap(() => this.logs.update(logs => logs.filter(l => l.id !== id)))
        );
    }
}
