import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProfileService, UserProfile } from '../../services/profile';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="flex-1 min-h-0 p-8 lg:p-12 overflow-y-auto custom-scrollbar">
      <div class="max-w-4xl mx-auto space-y-12">
        <!-- Header -->
        <div class="space-y-4">
          <h2 class="text-5xl font-black text-white tracking-tight font-display italic uppercase">Health <span class="text-indigo-400">Profile</span></h2>
          <p class="text-slate-400 font-medium italic">Configure your physical metrics to unlock personalized calorie and macro targets.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          <!-- Setup Form -->
          <div class="space-y-8">
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-8">
              <div class="card-elevated p-8 bg-white/[0.02] border-white/5 space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <!-- Age Field -->
                  <div class="space-y-3">
                    <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Your Age</label>
                    <input type="number" formControlName="age" placeholder="25"
                           class="w-full bg-[#1a1b24] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-outfit text-xl">
                  </div>

                  <!-- Gender Field -->
                  <div class="space-y-3">
                    <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Gender</label>
                    <select formControlName="gender"
                            class="w-full bg-[#1a1b24] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-outfit appearance-none">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <!-- Height Field -->
                  <div class="space-y-3">
                    <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Height (cm)</label>
                    <input type="number" formControlName="height_cm" placeholder="180"
                           class="w-full bg-[#1a1b24] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-outfit text-xl">
                  </div>

                  <!-- Current Weight Field -->
                  <div class="space-y-3">
                    <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Weight (kg)</label>
                    <input type="number" formControlName="weight_kg" placeholder="80"
                           class="w-full bg-[#1a1b24] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-outfit text-xl">
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <!-- Activity Level -->
                  <div class="space-y-3">
                    <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Activity Level</label>
                    <select formControlName="activity_level"
                            class="w-full bg-[#1a1b24] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-outfit appearance-none">
                      <option value="Sedentary">Sedentary (Office job)</option>
                      <option value="Lightly Active">Lightly Active (1-2 days/wk)</option>
                      <option value="Moderately Active">Moderately Active (3-5 days/wk)</option>
                      <option value="Very Active">Very Active (6-7 days/wk)</option>
                      <option value="Extra Active">Extra Active (Hard labor)</option>
                    </select>
                  </div>

                  <!-- Primary Goal -->
                  <div class="space-y-3">
                    <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Fitness Goal</label>
                    <select formControlName="goal"
                            class="w-full bg-[#1a1b24] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-outfit appearance-none">
                      <option value="Cut">Weight Loss (Cut)</option>
                      <option value="Maintain">Maintenance (Recomp)</option>
                      <option value="Bulk">Muscle Gain (Bulk)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="flex justify-end pt-4">
                <button type="submit" [disabled]="!profileForm.valid"
                        class="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-black shadow-2xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 uppercase tracking-widest text-xs">
                  Save Health Profile
                </button>
              </div>
            </form>
          </div>

          <!-- Live Results / Preview -->
          <div class="space-y-8">
             <div class="card-elevated p-8 space-y-8 relative overflow-hidden group border border-theme-border bg-theme-bg">
               <div class="relative z-10">
                 <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Calculated BMI</h3>
                 <div class="flex items-end space-x-3">
                   <span class="text-6xl font-black text-white font-outfit">{{calculatedBMI()}}</span>
                   <span class="text-indigo-400 font-black text-xs mb-2 uppercase tracking-widest">{{bmiStatus()}}</span>
                 </div>
               </div>

               <div class="pt-8 border-t border-white/5 space-y-6">
                 <div>
                   <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Daily TDEE</h3>
                   <div class="flex items-baseline space-x-2">
                     <span class="text-3xl font-black text-white font-outfit">{{profileService.profile()?.tdee | number:'1.0-0'}}</span>
                     <span class="text-slate-500 font-bold text-[10px] uppercase">kcal / day</span>
                   </div>
                 </div>

                <div class="p-6 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl">
                   <h3 class="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em] mb-3">Daily Calorie Target</h3>
                   <div class="flex items-baseline space-x-2">
                     <span class="text-4xl font-black text-white font-outfit">{{profileService.profile()?.calorie_target | number:'1.0-0'}}</span>
                     <span class="text-emerald-400 font-bold text-xs uppercase italic">kcal</span>
                   </div>
                 </div>
               </div>
             </div>

             <!-- BMI Reference Table -->
             <div class="card-elevated p-8 bg-white/[0.02] border-white/5 space-y-6">
               <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">BMI Reference</h3>
               <div class="space-y-4">
                 <div *ngFor="let cat of [
                   {range: '< 18.5', label: 'Underweight', color: 'text-amber-400'},
                   {range: '18.5 – 24.9', label: 'Normal / Healthy', color: 'text-emerald-400', check: true},
                   {range: '25.0 – 29.9', label: 'Overweight', color: 'text-amber-500'},
                   {range: '≥ 30.0', label: 'Obese', color: 'text-rose-500'}
                 ]" class="flex items-center justify-between text-[11px] font-bold">
                   <span class="text-slate-500 uppercase tracking-tighter">{{cat.range}}</span>
                   <span [class]="cat.color" class="uppercase tracking-widest flex items-center">
                     <span *ngIf="cat.check" class="mr-1.5 text-[10px]">✅</span>
                     {{cat.label}}
                   </span>
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
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  profileService = inject(ProfileService);
  private router = inject(Router);

  profileForm = this.fb.group({
    age: [null as number | null, [Validators.required, Validators.min(1), Validators.max(120)]],
    gender: ['Male', Validators.required],
    height_cm: [null as number | null, [Validators.required, Validators.min(50), Validators.max(250)]],
    weight_kg: [null as number | null, [Validators.required, Validators.min(10), Validators.max(500)]],
    activity_level: ['Moderately Active', Validators.required],
    goal: ['Maintain', Validators.required]
  });

  formValue = toSignal(this.profileForm.valueChanges, { initialValue: this.profileForm.getRawValue() });

  calculatedBMI = computed(() => {
    const v = this.formValue();
    const w = v?.weight_kg as number;
    const h = v?.height_cm as number;
    if (!w || !h) return '0.0';
    return this.profileService.calculateBMI(w, h);
  });

  bmiStatus = computed(() => {
    const bmi = Number(this.calculatedBMI());
    if (bmi === 0) return '---';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Healthy';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  });

  ngOnInit() {
    this.profileService.fetchProfile().subscribe(profile => {
      if (profile) {
        this.profileForm.patchValue({
          age: profile.age,
          gender: profile.gender || 'Male',
          height_cm: profile.height_cm,
          weight_kg: profile.weight_kg,
          activity_level: profile.activity_level || 'Moderately Active',
          goal: profile.goal || 'Maintain'
        });
      }
    });
  }

  saveProfile() {
    if (this.profileForm.valid) {
      this.profileService.updateProfile(this.profileForm.value as any).subscribe({
        next: () => {
          this.router.navigate(['/workout/nutrition']);
        },
        error: (err: any) => console.error('Error updating profile:', err)
      });
    }
  }
}
