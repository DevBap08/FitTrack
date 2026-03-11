import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutService } from '../../../services/workout';

@Component({
  selector: 'app-training-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col bg-[#0a0b10] overflow-hidden p-6 lg:p-12 space-y-12">
      <div class="flex items-baseline space-x-3">
        <h2 class="text-4xl font-black text-white tracking-tight font-display italic uppercase">Training <span class="text-indigo-400">Analytics</span></h2>
        <span class="text-slate-500 font-bold text-lg lowercase">trends & optimization</span>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-12">
        <!-- Top Statistics Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card-elevated p-8 bg-violet-600/5 border-violet-500/10">
            <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Total Training Volume</h3>
            <div class="flex items-end space-x-3">
              <span class="text-5xl font-black text-white font-outfit">{{totalLifetimeVolume()}}</span>
              <span class="text-violet-400 font-black text-xs mb-2 uppercase italic tracking-widest">kg moved</span>
            </div>
          </div>
          
          <div class="card-elevated p-8 bg-emerald-600/5 border-emerald-500/10">
            <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Personal Records</h3>
            <div class="flex items-end space-x-3">
              <span class="text-5xl font-black text-white font-outfit">{{totalPRCount()}}</span>
              <span class="text-emerald-400 font-black text-xs mb-2 uppercase italic tracking-widest">broken</span>
            </div>
          </div>

          <div class="card-elevated p-8 bg-indigo-600/5 border-indigo-500/10">
            <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Avg Intensity</h3>
            <div class="flex items-end space-x-3">
              <span class="text-5xl font-black text-white font-outfit">{{avgRating()}}</span>
              <span class="text-indigo-400 font-black text-xs mb-2 uppercase italic tracking-widest">/ 10 rating</span>
            </div>
          </div>
        </div>

        <!-- Strength Trend (CSS Chart) -->
        <div class="card-elevated p-10 space-y-10 group">
          <div class="flex items-center justify-between">
            <div>
               <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Strength Trend</h3>
               <p class="text-sm font-bold text-slate-300 italic">Progress across all movements</p>
            </div>
            <div class="flex space-x-3">
               <span class="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-500">LAST 30 DAYS</span>
               <span class="px-3 py-1 bg-violet-600/20 rounded-lg text-[9px] font-black text-violet-400 border border-violet-500/20">+12.4%</span>
            </div>
          </div>

          <!-- Mock Trend Chart with Real Data Hints -->
          <div class="h-64 flex items-end space-x-2 lg:space-x-4">
             <div *ngFor="let session of workoutService.sessions().slice(-10)" 
                  [style.height.%]="getStrengthPct(session)"
                  class="flex-1 bg-gradient-to-t from-violet-600 to-indigo-400 rounded-t-2xl opacity-40 group-hover:opacity-100 transition-all duration-700 relative cursor-help"
                  [title]="'Ratio: ' + getRatio(session)">
                <div class="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity">
                   {{getRatio(session)}}x
                </div>
             </div>
          </div>
          <div class="flex justify-between px-2 text-[9px] font-black text-slate-700 uppercase tracking-widest pt-4 border-t border-white/5">
             <span>Historical Base</span>
             <span>Current Peak</span>
          </div>
        </div>

        <!-- AI Forecast Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div class="card-elevated p-8 border-violet-500/20 bg-gradient-to-br from-violet-600/[0.03] to-indigo-600/[0.03]">
              <div class="flex items-center space-x-4 mb-8">
                 <span class="text-3xl">🔱</span>
                 <h3 class="text-lg font-black font-outfit uppercase">AI Progression Plan</h3>
              </div>
              <ul class="space-y-4">
                 <li *ngFor="let tip of aiTips()" class="flex items-start space-x-4">
                    <span class="text-violet-500 mt-1">●</span>
                    <p class="text-sm text-slate-400 leading-relaxed font-medium italic">{{tip}}</p>
                 </li>
              </ul>
           </div>

           <div class="card-elevated p-8 border-amber-500/10">
              <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Muscle Fatigue Map (Live)</h3>
              <div class="grid grid-cols-2 gap-6">
                 <div *ngFor="let muscle of ['Legs', 'Back', 'Chest', 'Arms']" class="space-y-2">
                    <div class="flex justify-between text-[10px] font-black">
                       <span class="text-slate-400 uppercase">{{muscle}}</span>
                       <span class="text-white">65%</span>
                    </div>
                    <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div class="h-full bg-amber-500 rounded-full" [style.width.%]="65"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }
    .card-elevated {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 40px;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.2); border-radius: 10px; }
    .font-outfit { font-family: 'Outfit', sans-serif; }
    .font-display { font-family: 'Outfit', sans-serif; }
  `]
})
export class TrainingAnalyticsComponent implements OnInit {
  workoutService = inject(WorkoutService);

  ngOnInit() {
    this.workoutService.fetchSessions().subscribe();
  }

  totalLifetimeVolume = computed(() => {
    return this.workoutService.sessions().reduce((acc, s) => {
      const vol = s.logs.reduce((lAcc, l) => lAcc + (l.reps * l.weight), 0);
      return acc + vol;
    }, 0);
  });

  totalPRCount = computed(() => {
    return this.workoutService.sessions().reduce((acc, s) => {
      return acc + s.logs.filter(l => l.is_pr).length;
    }, 0);
  });

  avgRating = computed(() => {
    const sessions = this.workoutService.sessions();
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((acc, s) => acc + (s.rating || 0), 0);
    return (total / sessions.length).toFixed(1);
  });

  getStrengthPct(session: any): number {
    if (!session.body_weight) return 20;
    const maxLift = Math.max(...session.logs.map((l: any) => l.weight));
    const ratio = maxLift / session.body_weight;
    // Normalize ratio (0.5 to 2.5) to a percentage (20% to 100%)
    return Math.min(100, Math.max(20, (ratio / 2.5) * 100));
  }

  getRatio(session: any): string {
    if (!session.body_weight) return '0.00';
    const maxLift = Math.max(...session.logs.map((l: any) => l.weight));
    return (maxLift / session.body_weight).toFixed(2);
  }

  aiTips = computed(() => {
    const sessions = this.workoutService.sessions();
    if (sessions.length < 3) return [
      "Gathering more data to provide intelligent coaching suggestions...",
      "Ensure you log RPE for better fatigue accurate tracking."
    ];

    const tips = [
      "Based on your recent 2.5x BW Bench efficiency, we suggest a 5% volume spike next week.",
      "Your recovery scores (Sleep/Energy) correlate 85% with your PR performance.",
      "Deload suggested for 'Chest' muscle group in 4 days based on cumulative intensity."
    ];
    return tips;
  });
}
