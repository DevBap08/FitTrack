import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  tasks = signal<any[]>([]);

  private getHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tasks`, { headers: this.getHeaders() }).pipe(
      tap(tasks => this.tasks.set(tasks))
    );
  }

  createTask(task: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks`, task, { headers: this.getHeaders() }).pipe(
      tap(newTask => {
        this.tasks.update(currentTasks => [...currentTasks, newTask]);
      })
    );
  }

  updateTaskStatus(taskId: number, completed: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/tasks/${taskId}?completed=${completed}`, {}, { headers: this.getHeaders() }).pipe(
      tap(updatedTask => {
        this.tasks.update(currentTasks =>
          currentTasks.map(t => t.id === taskId ? updatedTask : t)
        );
      })
    );
  }
}
