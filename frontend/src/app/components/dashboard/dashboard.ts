import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { WorkoutService } from '../../services/workout';
import { ProfileService } from '../../services/profile';
import { FoodService } from '../../services/food';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  workoutService = inject(WorkoutService);
  profileService = inject(ProfileService);
  foodService = inject(FoodService);

  activeTab = 'Workout'; // Default to workout for testing phase 8
  currentDate = '';
  fullDate = '';

  // Heatmap logic
  heatmapDays = computed(() => {
    const sessions = this.workoutService.sessions();
    const days = [];
    const today = new Date();
    // last 90 days for heatmap
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const hasSession = sessions.some(s => s.date?.split('T')[0] === dateStr);
      days.push({ date: dateStr, intensity: hasSession ? 1 : 0 });
    }
    return days;
  });

  ngOnInit() {
    this.updateDateInfo();
    this.workoutService.fetchSessions().subscribe();
    this.profileService.fetchProfile().subscribe();
    this.loadTodayLogs();
  }

  loadTodayLogs() {
    const today = new Date().toISOString().split('T')[0];
    this.foodService.fetchLogs(today).subscribe();
  }

  calorieProgress = computed(() => {
    const profile = this.profileService.profile();
    const logs = this.foodService.logs();
    const target = profile?.calorie_target || 2000;
    const consumed = logs.reduce((acc, curr) => acc + (curr.calories || 0), 0);
    const percent = Math.min(100, Math.round((consumed / target) * 100));
    return { consumed: Math.round(consumed), target: Math.round(target), percent };
  });

  proteinProgress = computed(() => {
    const profile = this.profileService.profile();
    const logs = this.foodService.logs();
    const calorieTarget = profile?.calorie_target || 2000;
    const target = Math.round((calorieTarget * 0.3) / 4);
    const current = logs.reduce((acc, curr) => acc + (curr.protein || 0), 0);
    const percent = Math.min(100, Math.round((current / target) * 100));
    return { current: Math.round(current), target, percent };
  });

  updateDateInfo() {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('en-US', { weekday: 'long' });
    this.fullDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  logout() {
    this.authService.logout();
  }
}
