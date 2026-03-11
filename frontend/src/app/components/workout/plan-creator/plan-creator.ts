import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { WorkoutService, Exercise } from '../../../services/workout';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-plan-creator',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './plan-creator.html',
    styleUrl: './plan-creator.css',
    styles: [`
        :host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }
    `]
})
export class PlanCreatorComponent {
    private fb = inject(FormBuilder);
    private workoutService = inject(WorkoutService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    isEditMode = false;
    planId: number | null = null;

    planForm = this.fb.group({
        name: ['', [Validators.required]],
        exercises: this.fb.array([])
    });

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.planId = +params['id'];
                this.loadPlan(this.planId);
            } else {
                // Add an initial exercise for new plans
                this.addExercise();
            }
        });
    }

    loadPlan(id: number) {
        this.workoutService.fetchPlans().subscribe(plans => {
            const plan = plans.find(p => p.id === id);
            if (plan) {
                this.planForm.patchValue({ name: plan.name });
                this.exercises.clear();
                plan.exercises.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)).forEach(ex => {
                    this.exercises.push(this.fb.group({
                        name: [ex.name, Validators.required],
                        target_sets: [ex.target_sets, [Validators.required, Validators.min(1)]],
                        target_reps: [ex.target_reps, [Validators.required, Validators.min(1)]],
                        target_weight: [ex.target_weight || 0, [Validators.min(0)]],
                        muscle_group: [ex.muscle_group || 'Chest'],
                        video_url: [ex.video_url || '']
                    }));
                });
            }
        });
    }

    get exercises() {
        return this.planForm.get('exercises') as FormArray;
    }

    addExercise() {
        const exerciseGroup = this.fb.group({
            name: ['', Validators.required],
            target_sets: [3, [Validators.required, Validators.min(1)]],
            target_reps: [10, [Validators.required, Validators.min(1)]],
            target_weight: [0, [Validators.min(0)]],
            muscle_group: ['Chest'],
            video_url: ['']
        });
        this.exercises.push(exerciseGroup);
    }

    removeExercise(index: number) {
        this.exercises.removeAt(index);
    }

    moveExercise(index: number, direction: 'up' | 'down') {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < this.exercises.length) {
            const temp = this.exercises.at(index);
            this.exercises.removeAt(index);
            this.exercises.insert(newIndex, temp);
        }
    }

    onSubmit() {
        if (this.planForm.valid) {
            const planValue = this.planForm.value;
            // Convert to type-safe plan with order_index
            const plan = {
                name: planValue.name as string,
                exercises: (planValue.exercises as any[]).map((ex, idx) => ({
                    ...ex,
                    order_index: idx
                })) as Exercise[]
            };

            const request = this.isEditMode && this.planId
                ? this.workoutService.updatePlan(this.planId, plan)
                : this.workoutService.createPlan(plan);

            request.subscribe({
                next: () => {
                    this.router.navigate(['/workout/select']);
                },
                error: (err) => console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} plan:`, err)
            });
        }
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }
}
