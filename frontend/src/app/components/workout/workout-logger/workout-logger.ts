import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutService, WorkoutPlan, WorkoutSession, SetLog, Exercise } from '../../../services/workout';
import { TimerService } from '../../../services/timer';
import { Router, ActivatedRoute } from '@angular/router';
import { SafePipe } from '../../../pipes/safe.pipe';

@Component({
    selector: 'app-workout-logger',
    standalone: true,
    imports: [CommonModule, FormsModule, SafePipe],
    templateUrl: './workout-logger.html',
    styleUrl: './workout-logger.css'
})
export class WorkoutLoggerComponent implements OnInit {
    workoutService = inject(WorkoutService);
    timerService = inject(TimerService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    selectedPlan = signal<WorkoutPlan | null>(null);
    currentSession = signal<WorkoutSession | null>(null);
    sessionLogs = signal<SetLog[]>([]);
    customRestTime = signal<number>(105); // Default to 1:45 (105s)

    // Phase 8: Tracking & Analytics signals
    showCheckIn = signal<boolean>(false);
    showSummary = signal<boolean>(false);
    sessionStartTime = signal<Date | null>(null);
    sessionEndTime = signal<Date | null>(null);

    checkIn = {
        weight: 0,
        sleep: 3,
        energy: 3,
        pain: false
    };
    sessionRating = signal<number>(5);

    activeExerciseIndex = signal<number>(0);
    currentExercise = computed(() => {
        const plan = this.selectedPlan();
        if (!plan) return null;
        return plan.exercises[this.activeExerciseIndex()];
    });

    workoutStarted = computed(() => this.currentSession() !== null);

    totalVolume = computed(() => {
        return this.sessionLogs().reduce((acc, log) => acc + (log.reps * log.weight), 0);
    });

    // Track inputs and history for each exercise
    exerciseInputs: { [key: number]: { reps: number, weight: number, rpe: number, notes: string } } = {};
    exerciseHistory = signal<{ [key: number]: SetLog[] }>({});

    ngOnInit() {
        const planId = Number(this.route.snapshot.paramMap.get('id'));
        if (planId) {
            this.workoutService.fetchPlans().subscribe(plans => {
                const plan = plans.find(p => p.id === planId);
                if (plan) {
                    this.selectedPlan.set(plan);
                    this.showCheckIn.set(true); // Show check-in first
                } else {
                    this.router.navigate(['/workout/select']);
                }
            });
        } else {
            this.router.navigate(['/workout/select']);
        }
    }

    startWorkout() {
        const plan = this.selectedPlan();
        if (!plan || !this.checkIn.weight || this.checkIn.weight <= 0) return;

        this.showCheckIn.set(false);
        this.sessionStartTime.set(new Date());
        this.initSession(plan);
    }

    private initSession(plan: WorkoutPlan) {
        this.activeExerciseIndex.set(0);
        this.currentSession.set({
            plan_id: plan.id!,
            logs: [],
            body_weight: this.checkIn.weight,
            sleep_quality: this.checkIn.sleep,
            energy_level: this.checkIn.energy,
            has_pain: this.checkIn.pain,
            start_time: this.sessionStartTime()?.toISOString()
        });

        // Initialize inputs and fetch history for each exercise
        plan.exercises.forEach(ex => {
            this.exerciseInputs[ex.id!] = {
                reps: ex.target_reps,
                weight: ex.target_weight || 0,
                rpe: 8, // Standard high effort default
                notes: ''
            };

            this.workoutService.getExerciseHistory(ex.id!).subscribe(history => {
                this.exerciseHistory.update(prev => ({
                    ...prev,
                    [ex.id!]: history
                }));
                // Pre-fill weight from last session if available
                if (history.length > 0) {
                    this.exerciseInputs[ex.id!].weight = history[0].weight;
                }
            });
        });
    }

    getEmbedUrl(url: string | null | undefined): string | null {
        if (!url) return null;

        const u = url.trim();
        if (u.includes('youtube.com/watch?v=')) {
            const id = u.split('v=')[1]?.split('&')[0];
            return `https://www.youtube.com/embed/${id}?mute=1`;
        }
        if (u.includes('youtu.be/')) {
            const id = u.split('youtu.be/')[1]?.split('?')[0];
            return `https://www.youtube.com/embed/${id}?mute=1`;
        }
        if (u.includes('youtube.com/shorts/')) {
            const id = u.split('shorts/')[1]?.split('?')[0];
            return `https://www.youtube.com/embed/${id}?mute=1`;
        }
        if (u.includes('vimeo.com/')) {
            const id = u.split('vimeo.com/')[1]?.split('?')[0];
            return `https://player.vimeo.com/video/${id}?muted=1`;
        }

        if (u.includes('embed')) {
            const separator = u.includes('?') ? '&' : '?';
            const muteParam = u.includes('vimeo') ? 'muted=1' : 'mute=1';
            return `${u}${separator}${muteParam}`;
        }
        return null;
    }

    logSet(exercise: Exercise) {
        const input = this.exerciseInputs[exercise.id!];
        const newLog: SetLog = {
            exercise_id: exercise.id!,
            reps: input.reps,
            weight: input.weight,
            rpe: input.rpe,
            notes: input.notes,
            is_pr: this.isPR(exercise.id!, input.reps, input.weight)
        };

        this.sessionLogs.update(logs => [...logs, newLog]);

        // Reset notes for next set (keep weight/reps/rpe)
        this.exerciseInputs[exercise.id!].notes = '';

        // Start rest timer with custom duration
        this.timerService.startTimer(this.customRestTime());
    }

    adjustRestTime(delta: number) {
        this.customRestTime.update(t => Math.max(0, t + delta));
    }

    getLogsForExercise(exerciseId: number) {
        return this.sessionLogs().filter(log => log.exercise_id === exerciseId);
    }

    isPR(exerciseId: number, reps: number, weight: number): boolean {
        const history = this.exerciseHistory()[exerciseId];
        if (!history || history.length === 0) return true; // First time is PR

        // Simple PR logic: check if current performance beats best in history
        return history.every(h => (weight > h.weight) || (weight === h.weight && reps > h.reps));
    }

    selectExercise(index: number) {
        this.activeExerciseIndex.set(index);
    }

    nextExercise() {
        const plan = this.selectedPlan();
        if (plan && this.activeExerciseIndex() < plan.exercises.length - 1) {
            this.activeExerciseIndex.update(i => i + 1);
        }
    }

    finishWorkout() {
        if (this.currentSession()) {
            this.sessionEndTime.set(new Date());
            const session: WorkoutSession = {
                ...this.currentSession()!,
                end_time: this.sessionEndTime()?.toISOString(),
                rating: this.sessionRating(),
                logs: this.sessionLogs()
            };

            this.workoutService.logSession(session).subscribe({
                next: () => {
                    this.showSummary.set(true); // Show success/summary before leaving
                    this.timerService.stopTimer();
                },
                error: (err) => console.error('Error logging session:', err)
            });
        }
    }

    closeSummary() {
        this.router.navigate(['/dashboard']);
    }

    cancelWorkout() {
        if (confirm('Cancel workout? Progress will not be saved.')) {
            this.selectedPlan.set(null);
            this.currentSession.set(null);
            this.sessionLogs.set([]);
            this.timerService.stopTimer();
            this.router.navigate(['/workout/select']);
        }
    }

    goBack() {
        this.router.navigate(['/workout/select']);
    }
}
