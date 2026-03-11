import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { PlanCreatorComponent } from './components/workout/plan-creator/plan-creator';
import { WorkoutLoggerComponent } from './components/workout/workout-logger/workout-logger';
import { RoutineSelectorComponent } from './components/workout/routine-selector/routine-selector';
import { ProfileComponent } from './components/profile/profile';
import { CalorieTrackerComponent } from './components/workout/calorie-tracker/calorie-tracker';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout';
import { TrainingHistoryComponent } from './components/workout/training-history/training-history';
import { TrainingAnalyticsComponent } from './components/workout/training-analytics/training-analytics';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'workout/select', component: RoutineSelectorComponent },
            { path: 'workout/history', component: TrainingHistoryComponent },
            { path: 'workout/nutrition', component: CalorieTrackerComponent },
            { path: 'workout/analytics', component: TrainingAnalyticsComponent },
            { path: 'workout/create-plan', component: PlanCreatorComponent },
            { path: 'workout/edit-plan/:id', component: PlanCreatorComponent },
            { path: 'profile', component: ProfileComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    // Workout Logger is full-screen for focus
    { path: 'workout/log/:id', component: WorkoutLoggerComponent },
    { path: '**', redirectTo: '/login' }
];
