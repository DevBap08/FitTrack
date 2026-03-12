import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutService, WorkoutSession } from '../../../services/workout';

@Component({
  selector: 'app-training-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col bg-[#0a0b10] overflow-hidden p-4 sm:p-8 lg:p-12 space-y-8 lg:space-y-10">
      <div class="flex items-baseline space-x-3">
        <h2 class="text-2xl sm:text-4xl font-black text-white tracking-tight font-display italic uppercase">Training <span class="text-violet-400">History</span></h2>
        <span class="text-slate-500 font-bold text-sm sm:text-lg lowercase">summaries & details</span>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-6 pr-2">
        <div *ngFor="let session of sessions()" 
             class="card-elevated group p-5 sm:p-8 hover:bg-[#12131a] transition-all border-white/5 hover:border-violet-500/20 relative overflow-hidden">
          
          <div class="relative z-10">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div class="space-y-2">
                <div class="flex items-center space-x-3">
                   <h3 class="text-2xl font-black font-outfit group-hover:text-violet-400 transition-colors uppercase tracking-tight">{{getPlanName(session.plan_id)}}</h3>
                   <span class="px-3 py-1 bg-violet-600/10 text-violet-400 border border-violet-500/20 text-[9px] font-black uppercase tracking-widest rounded-lg">Session #{{session.id}}</span>
                </div>
                <p class="text-slate-500 font-bold uppercase tracking-widest text-xs">{{formatDate(session.date)}} · {{getDuration(session)}} mins</p>
              </div>

              <div class="flex items-center space-x-12">
                <div class="text-center">
                  <p class="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Volume</p>
                  <p class="text-xl font-black font-outfit">{{getTotalVolume(session)}}kg</p>
                </div>
                <div class="text-center">
                  <p class="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">PRs Broken</p>
                  <p class="text-xl font-black font-outfit text-emerald-400">{{getPRCount(session)}}</p>
                </div>
                <div class="text-center">
                  <p class="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Ratio</p>
                  <p class="text-xl font-black font-outfit text-indigo-400">{{getStrengthToWeightRatio(session)}}x</p>
                </div>
                <div class="text-center">
                  <p class="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Intensity</p>
                  <p class="text-xl font-black font-outfit text-amber-400">{{session.rating}}/10</p>
                </div>
              </div>
            </div>

            <!-- AI Suggestion Hub -->
            <div class="bg-violet-600/5 border border-violet-500/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-8 flex items-center space-x-4">
               <div class="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center text-xl">🤖</div>
               <div>
                  <p class="text-[9px] font-black text-violet-400 uppercase tracking-[0.2em] mb-1">AI Training Insight</p>
                  <p class="text-xs font-bold text-slate-300 italic">"{{getAISuggestion(session)}}"</p>
               </div>
            </div>

            <!-- Health Metrics Row -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/5 mb-8">
              <div class="text-center md:text-left">
                <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Sleep</p>
                <p class="text-sm font-bold text-violet-200">{{session.sleep_quality}}/5</p>
              </div>
              <div class="text-center md:text-left">
                <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Energy</p>
                <p class="text-sm font-bold text-violet-200">{{session.energy_level}}/5</p>
              </div>
              <div class="text-center md:text-left">
                <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Pain/Soreness</p>
                <p class="text-sm font-bold" [class]="session.has_pain ? 'text-rose-400' : 'text-emerald-400'">{{session.has_pain ? 'Yes' : 'No'}}</p>
              </div>
              <div class="text-center md:text-left">
                <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Body Weight</p>
                <p class="text-sm font-bold text-violet-200">{{session.body_weight}}kg</p>
              </div>
            </div>

            <!-- Set Logs Expandable (Implicitly always visible in history for now) -->
            <div class="space-y-6">
               <h4 class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Detailed Log</h4>
               <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div *ngFor="let log of session.logs" class="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-2">
                     <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">{{getExerciseName(log.exercise_id)}}</p>
                     <div class="flex items-end justify-between">
                        <p class="text-lg font-black font-outfit text-white">{{log.reps}} <span class="text-[10px] text-slate-600">×</span> {{log.weight}}kg</p>
                        <span class="text-[9px] font-black text-violet-400 uppercase tracking-widest">RPE {{log.rpe}}</span>
                     </div>
                     <p *ngIf="log.notes" class="text-[9px] text-slate-500 italic mt-1 font-medium">"{{log.notes}}"</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div *ngIf="sessions().length === 0" class="py-32 text-center text-slate-600 border-2 border-dashed border-white/5 rounded-[48px]">
          <p class="font-bold uppercase tracking-widest text-xs">No training history found. Finish your first session!</p>
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
    .custom-scrollbar::-webkit-scrollbar {
      width: 5px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(139, 92, 246, 0.2);
      border-radius: 10px;
    }
    .font-outfit { font-family: 'Outfit', sans-serif; }
    .font-display { font-family: 'Outfit', sans-serif; }
  `]
})
export class TrainingHistoryComponent implements OnInit {
  workoutService = inject(WorkoutService);
  sessions = this.workoutService.sessions;

  ngOnInit() {
    this.workoutService.fetchSessions().subscribe();
    this.workoutService.fetchPlans().subscribe();
  }

  getPlanName(planId: number): string {
    const plan = this.workoutService.plans().find(p => p.id === planId);
    return plan ? plan.name : 'Unknown Routine';
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDuration(session: WorkoutSession): string {
    if (!session.start_time || !session.end_time) return 'N/A';
    const start = new Date(session.start_time).getTime();
    const end = new Date(session.end_time).getTime();
    return Math.round((end - start) / 60000).toString();
  }

  getTotalVolume(session: WorkoutSession): number {
    return session.logs.reduce((acc, log) => acc + (log.reps * log.weight), 0);
  }

  getPRCount(session: WorkoutSession): number {
    return session.logs.filter(log => log.is_pr).length;
  }

  getStrengthToWeightRatio(session: WorkoutSession): string {
    if (!session.body_weight || session.logs.length === 0) return '0.00';
    const maxLift = Math.max(...session.logs.map(l => l.weight));
    return (maxLift / session.body_weight).toFixed(2);
  }

  getAISuggestion(session: WorkoutSession): string {
    const prs = this.getPRCount(session);
    const rpeAvg = session.logs.reduce((acc, l) => acc + (l.rpe || 0), 0) / session.logs.length;

    if (prs > 2) return "Exceptional session! You broke multiple PRs. Increase weight by 2.5kg next time.";
    if (rpeAvg < 7) return "RPE is low. You have more in the tank. Increase intensity next session.";
    if (session.has_pain) return "Pain detected. Consider a deload or focusing on mobility for these muscle groups.";
    if (session.sleep_quality && session.sleep_quality < 3) return "Recovery compromised by sleep. Prioritize rest before next max effort.";

    return "Solid consistency. Maintain current volume and focus on form execution.";
  }

  getExerciseName(exerciseId: number): string {
    // Find exercise name from any plan that has it (or would be better in a central exercise store)
    for (const plan of this.workoutService.plans()) {
      const ex = plan.exercises.find(e => e.id === exerciseId);
      if (ex) return ex.name;
    }
    return 'Exercise';
  }
}
