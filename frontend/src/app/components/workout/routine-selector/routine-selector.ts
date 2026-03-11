import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkoutService, WorkoutPlan } from '../../../services/workout';

@Component({
    selector: 'app-routine-selector',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './routine-selector.html',
    styleUrl: './routine-selector.css',
    styles: [`
        :host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }
    `]
})
export class RoutineSelectorComponent implements OnInit {
    workoutService = inject(WorkoutService);
    private router = inject(Router);

    ngOnInit() {
        this.workoutService.fetchPlans().subscribe();
    }

    selectPlan(plan: WorkoutPlan) {
        this.router.navigate(['/workout/log', plan.id]);
    }

    editPlan(event: Event, planId: number) {
        event.stopPropagation();
        this.router.navigate(['/workout/edit-plan', planId]);
    }

    deletePlan(event: Event, planId: number) {
        event.stopPropagation();
        if (confirm('Are you sure you want to delete this routine? This action cannot be undone.')) {
            this.workoutService.deletePlan(planId).subscribe({
                error: (err) => console.error('Error deleting plan:', err)
            });
        }
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }

    createNew() {
        this.router.navigate(['/workout/create-plan']);
    }
}
