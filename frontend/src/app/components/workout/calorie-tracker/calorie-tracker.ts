import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FoodService, FoodLog } from '../../../services/food';
import { ProfileService } from '../../../services/profile';

@Component({
  selector: 'app-calorie-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="flex-1 min-h-0 p-6 lg:p-12 overflow-y-auto custom-scrollbar">
      <div class="max-w-6xl mx-auto space-y-8 lg:space-y-12">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="space-y-4">
            <h2 class="text-4xl lg:text-5xl font-black text-white tracking-tight font-display italic uppercase">Calorie <span class="text-emerald-400">Log</span></h2>
            <p class="text-slate-400 font-medium italic">Track your macros and stay within your calculated daily limits.</p>
          </div>
          
          <div class="flex w-full md:w-auto bg-white/5 p-1 rounded-2xl border border-white/5">
            <button class="flex-1 md:flex-none px-6 py-3 lg:py-2 bg-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20">Today</button>
            <button class="flex-1 md:flex-none px-6 py-3 lg:py-2 hover:text-white text-slate-500 text-xs font-black uppercase tracking-widest transition-all opacity-40">Previous</button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          <!-- Main Content: Log & Stats -->
          <div class="space-y-12">
            <!-- Macro Progress Hub -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div *ngFor="let macro of macroStats()" 
                   class="card-elevated p-6 space-y-4 relative overflow-hidden group">
                <div class="relative z-10">
                  <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-widest underline decoration-white/10 underline-offset-4 mb-4">{{macro.label}}</h3>
                  <div class="flex items-baseline space-x-2">
                    <span class="text-3xl font-black text-white font-outfit">{{macro.current}}</span>
                    <span class="text-slate-500 text-xs font-bold uppercase">/ {{macro.target}}</span>
                  </div>
                  <div class="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div [class]="macro.barColor" 
                         class="h-full transition-all duration-1000" 
                         [style.width.%]="macro.percent"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Food Entries -->
            <div class="space-y-6">
              <div class="flex items-center justify-between px-2">
                <h3 class="text-xl font-black text-white font-display italic uppercase">Consumed Today</h3>
                <span class="text-slate-500 text-xs font-bold tracking-widest uppercase">{{foodService.logs().length}} Items</span>
              </div>

              <div class="space-y-2">
                <div *ngFor="let log of foodService.logs()" 
                     class="card-elevated group p-5 hover:bg-white/[0.03] transition-all flex items-center justify-between border-transparent hover:border-white/5">
                  <div class="flex items-center space-x-6">
                    <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                      🥘
                    </div>
                    <div>
                      <h4 class="font-bold text-white tracking-tight uppercase text-sm mb-1">{{log.food_name}}</h4>
                      <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest">{{log.grams}}g · {{log.calories}} kcal</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-8">
                    <div class="hidden md:flex space-x-6 text-[10px] font-black uppercase tracking-tighter">
                      <div class="flex flex-col items-center">
                        <span class="text-emerald-400">{{log.protein}}g</span>
                        <span class="text-slate-600">P</span>
                      </div>
                      <div class="flex flex-col items-center">
                        <span class="text-rose-400">{{log.fat}}g</span>
                        <span class="text-slate-600">F</span>
                      </div>
                    </div>
                    <button (click)="deleteLog(log.id!)" 
                            class="p-2 text-slate-700 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>

                <div *ngIf="foodService.logs().length === 0" 
                     class="py-24 text-center border-2 border-dashed border-white/5 rounded-[40px] space-y-4">
                  <span class="text-4xl opacity-20 block">🌾</span>
                  <p class="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">No food logged yet. Stay fueled!</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar: Logging Form -->
          <aside class="space-y-8">
            <div class="card-elevated p-6 lg:p-8 bg-emerald-500/[0.02] border-emerald-500/10 space-y-6 lg:space-y-8">
              <div class="space-y-2">
                <h3 class="text-xs font-black text-emerald-400 uppercase tracking-[0.3em]">Log Intake</h3>
                <p class="text-slate-500 text-[10px] font-medium leading-relaxed uppercase tracking-tighter italic">Quickly track your macros based on precise weight.</p>
              </div>

              <form [formGroup]="foodForm" (ngSubmit)="onSubmit()" class="space-y-6">
                <!-- Food Name -->
                <div class="space-y-3">
                  <label class="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Entry Name</label>
                  <input type="text" formControlName="food_name" placeholder="e.g. Grilled Chicken"
                         class="w-full bg-[#1a1b24] border border-white/5 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-sm">
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <!-- Grams -->
                  <div class="space-y-3">
                    <label class="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Weight (g)</label>
                    <input type="number" formControlName="grams" placeholder="200"
                           class="w-full bg-[#1a1b24] border border-white/5 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-sm">
                  </div>
                  <!-- Calories -->
                  <div class="space-y-3">
                    <label class="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Calories</label>
                    <input type="number" formControlName="calories" placeholder="320"
                           class="w-full bg-[#1a1b24] border border-white/5 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-sm">
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-3 pt-2">
                  <!-- Protein -->
                  <div class="space-y-3">
                    <label class="block text-[8px] font-black text-emerald-500/60 uppercase tracking-widest text-center">Protein</label>
                    <input type="number" formControlName="protein" placeholder="0"
                           class="w-full bg-[#1a1b24] border border-white/5 rounded-xl px-2 py-3 text-white focus:outline-none text-center text-xs">
                  </div>
                  <!-- Carbs -->
                  <div class="space-y-3">
                    <label class="block text-[8px] font-black text-amber-500/60 uppercase tracking-widest text-center">Carbs</label>
                    <input type="number" formControlName="carbs" placeholder="0"
                           class="w-full bg-[#1a1b24] border border-white/5 rounded-xl px-2 py-3 text-white focus:outline-none text-center text-xs">
                  </div>
                  <!-- Fat -->
                  <div class="space-y-3">
                    <label class="block text-[8px] font-black text-rose-500/60 uppercase tracking-widest text-center">Fat</label>
                    <input type="number" formControlName="fat" placeholder="0"
                           class="w-full bg-[#1a1b24] border border-white/5 rounded-xl px-2 py-3 text-white focus:outline-none text-center text-xs">
                  </div>
                </div>

                <button type="submit" [disabled]="!foodForm.valid"
                        class="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl text-white font-black shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 uppercase tracking-[0.2em] text-[10px]">
                  Confirm Entry
                </button>
              </form>
            </div>
            
            <!-- Quick Summary Card -->
            <div class="card-elevated p-6 lg:p-8 bg-indigo-600/5 group">
              <h3 class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 lg:mb-6 italic underline underline-offset-8 decoration-white/5">Coach Insights</h3>
              <p class="text-xs text-slate-400 leading-relaxed italic">Your protein intake is currently at <span class="text-emerald-400 font-bold">{{proteinPercent()}}%</span> of your target. Consider adding lean protein to your next meal to optimize recovery.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }
    .font-display { font-family: 'Outfit', sans-serif; }
    .font-outfit { font-family: 'Outfit', sans-serif; }
    .card-elevated {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 40px;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  `]
})
export class CalorieTrackerComponent implements OnInit {
  private fb = inject(FormBuilder);
  foodService = inject(FoodService);
  profileService = inject(ProfileService);

  foodForm = this.fb.group({
    food_name: ['', Validators.required],
    grams: [null, [Validators.required, Validators.min(1)]],
    calories: [null, [Validators.required, Validators.min(0)]],
    protein: [0, [Validators.min(0)]],
    carbs: [0, [Validators.min(0)]],
    fat: [0, [Validators.min(0)]]
  });

  macroStats = computed(() => {
    const logs = this.foodService.logs();
    const profile = this.profileService.profile();

    const calorieTarget = profile?.calorie_target || 2500;
    // Estimated macro targets based on typical split (40/30/30) if not explicitly set
    const proteinTarget = Math.round((calorieTarget * 0.3) / 4);
    const carbsTarget = Math.round((calorieTarget * 0.4) / 4);
    const fatTarget = Math.round((calorieTarget * 0.3) / 9);

    const totals = logs.reduce((acc, curr) => ({
      calories: acc.calories + (curr.calories || 0),
      protein: acc.protein + (curr.protein || 0),
      carbs: acc.carbs + (curr.carbs || 0),
      fat: acc.fat + (curr.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });


    return [
      { label: 'Calories', current: Math.round(totals.calories), target: Math.round(calorieTarget), percent: Math.min(100, (totals.calories / calorieTarget) * 100), bgColor: 'bg-emerald-500', barColor: 'bg-emerald-500 shadow-sm shadow-emerald-500/40' },
      { label: 'Protein (g)', current: Math.round(totals.protein), target: proteinTarget, percent: Math.min(100, (totals.protein / proteinTarget) * 100), bgColor: 'bg-indigo-500', barColor: 'bg-indigo-500 shadow-sm shadow-indigo-500/40' },
      { label: 'Carbs (g)', current: Math.round(totals.carbs), target: carbsTarget, percent: Math.min(100, (totals.carbs / carbsTarget) * 100), bgColor: 'bg-amber-500', barColor: 'bg-amber-500 shadow-sm shadow-amber-500/40' },
      { label: 'Fat (g)', current: Math.round(totals.fat), target: fatTarget, percent: Math.min(100, (totals.fat / fatTarget) * 100), bgColor: 'bg-rose-500', barColor: 'bg-rose-500 shadow-sm shadow-rose-500/40' }
    ];
  });

  proteinPercent = computed(() => {
    const stats = this.macroStats();
    return Math.round(stats[1].percent);
  });

  ngOnInit() {
    this.profileService.fetchProfile().subscribe();
    this.loadTodayLogs();
  }

  loadTodayLogs() {
    const today = new Date().toISOString().split('T')[0];
    this.foodService.fetchLogs(today).subscribe();
  }

  onSubmit() {
    if (this.foodForm.valid) {
      this.foodService.logFood(this.foodForm.value as unknown as FoodLog).subscribe(() => {
        this.foodForm.reset({ protein: 0, carbs: 0, fat: 0 });
      });
    }
  }

  deleteLog(id: number) {
    this.foodService.deleteLog(id).subscribe();
  }
}
