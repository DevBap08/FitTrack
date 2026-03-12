import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-theme-bg text-theme-text overflow-hidden relative">
      <!-- Mobile Backdrop Overlay -->
      <div *ngIf="isSidebarOpen()" 
           (click)="toggleSidebar()"
           class="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-300">
      </div>

      <!-- Sidebar -->
      <aside 
        class="fixed inset-y-0 left-0 z-50 transform w-64 lg:w-60 border-r border-theme-border bg-theme-bg flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0"
        [class.translate-x-0]="isSidebarOpen()"
        [class.-translate-x-full]="!isSidebarOpen()">
        <!-- Logo & Close Button (Mobile) -->
        <div class="h-16 lg:h-20 flex items-center justify-between px-6 border-b border-theme-border">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white bg-theme-accent flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 8-4-4-6 6"/><path d="m6 16 4 4 6-6"/><path d="M22 12A10 10 0 0 1 12 22"/><path d="M2 12A10 10 0 0 1 12 2"/></svg>
            </div>
            <span class="ml-3 font-semibold text-[15px] tracking-tight text-white">Linear<span class="text-theme-accent">Tracker</span></span>
          </div>
          <!-- Close button for mobile -->
          <button (click)="toggleSidebar()" class="lg:hidden text-theme-text-muted hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <a *ngFor="let item of navItems" 
             [routerLink]="item.path" 
             routerLinkActive="bg-theme-card text-white"
             [routerLinkActiveOptions]="{exact: item.exact}"
             (click)="closeSidebarOnMobile()"
             class="flex items-center p-2.5 rounded-lg transition-all group hover:bg-theme-card text-theme-text-muted hover:text-theme-text">
            <span class="w-5 h-5 flex-shrink-0" [innerHTML]="getIcon(item.id)"></span>
            <span class="ml-3 font-medium text-[15px] tracking-wide">{{item.label}}</span>
          </a>
        </nav>

        <!-- User Profile & Settings -->
        <div class="p-3 lg:p-4 border-t border-theme-border bg-theme-bg space-y-1">
          <!-- Theme Toggle -->
          <button (click)="toggleTheme()" 
                  class="w-full flex items-center p-2.5 text-theme-text-muted hover:bg-theme-card hover:text-theme-text rounded-lg transition-all text-[15px] font-medium tracking-wide mb-2">
            <span class="w-5 h-5 flex-shrink-0 text-theme-text-muted group-hover:text-theme-accent transition-colors">
              <svg *ngIf="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              <svg *ngIf="!isDarkMode" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            </span>
            <span class="ml-3 transition-colors">Toggle Theme</span>
          </button>

          <!-- Profile -->
          <a routerLink="/profile" routerLinkActive="bg-theme-card text-white"
             (click)="closeSidebarOnMobile()"
             class="w-full flex items-center p-2.5 text-theme-text-muted hover:bg-theme-card hover:text-theme-text rounded-lg transition-all text-[15px] font-medium tracking-wide">
            <span class="w-5 h-5 flex-shrink-0" [innerHTML]="getIcon('profile')"></span>
            <span class="ml-3 transition-colors">Profile</span>
          </a>

          <!-- Logout -->
          <button (click)="authService.logout()" 
                  class="w-full flex items-center p-2.5 text-theme-text-muted hover:bg-theme-card hover:text-theme-text rounded-lg transition-all text-[15px] font-medium tracking-wide">
            <span class="w-5 h-5 flex-shrink-0 text-theme-text-muted transition-colors hover:text-rose-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </span>
            <span class="ml-3 transition-colors hover:text-rose-400">Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-theme-bg w-full">
        <!-- Mobile Header (Hamburger) -->
        <header class="flex lg:hidden h-16 border-b border-theme-border items-center justify-between px-4 bg-theme-bg flex-shrink-0 z-30">
          <div class="flex items-center">
            <button (click)="toggleSidebar()" class="text-theme-text-muted p-2 hover:text-white hover:bg-theme-card rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <span class="ml-3 font-semibold text-[15px] tracking-tight text-white">Linear<span class="text-theme-accent">Tracker</span></span>
          </div>
        </header>

        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #232833;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #475266;
    }
  `]
})
export class MainLayoutComponent {
  authService = inject(AuthService);
  isDarkMode = true;
  isSidebarOpen = signal(false);

  toggleSidebar() {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

  closeSidebarOnMobile() {
    if (window.innerWidth < 1024) { // lg breakpoint is 1024px
      this.isSidebarOpen.set(false);
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }

  getIcon(id: string): any {
    const icons: Record<string, string> = {
      'dashboard': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
      'library': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 11 4-7"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8c.9 0 1.8-.7 2-1.6l1.7-7.4"/><path d="m9 11 1 9"/><path d="M4.5 15.5h15"/><path d="m15 11-1 9"/></svg>',
      'nutrition': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
      'history': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      'analytics': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>',
      'profile': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
    };
    return icons[id] || icons['dashboard'];
  }

  navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', exact: true },
    { id: 'library', label: 'Routine Library', path: '/workout/select', exact: true },
    { id: 'nutrition', label: 'Nutrition', path: '/workout/nutrition', exact: true },
    { id: 'history', label: 'History', path: '/workout/history', exact: true },
    { id: 'analytics', label: 'Analytics', path: '/workout/analytics', exact: true }
  ];
}
