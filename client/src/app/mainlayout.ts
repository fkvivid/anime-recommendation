import { Component, inject, signal, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './services/auth-service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  template: `
    <div class="flex flex-col min-h-screen bg-white">
      
      <nav class="sticky top-0 z-100 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16 items-center">
            
            <div class="flex items-center gap-2 cursor-pointer" routerLink="/">
              <mat-icon class="text-blue-600">movie_filter</mat-icon>
              <span class="text-xl font-bold tracking-tight text-slate-900">
                Anime<span class="text-blue-600">Rec</span>
              </span>
            </div>

            <div class="hidden md:flex items-center gap-8">
                <a routerLink="/animes" 
                  routerLinkActive="text-blue-600"
                  class="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Animes</a>
              @if (userDisplayName()) {
                <a routerLink="/my-animes" 
                  routerLinkActive="text-blue-600"
                  class="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">My Animes</a>
              }
              <a routerLink="/random" 
                routerLinkActive="text-blue-600"
                class="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Random</a>
            </div>

            <div class="flex items-center gap-4">
              @if (userDisplayName()) {
                <button [matMenuTriggerFor]="userMenu" class="flex items-center gap-2 p-1 rounded-full hover:bg-slate-50 transition-colors">
                  <span class="text-sm font-semibold text-slate-700 ml-2 hidden sm:block">{{ userDisplayName() }}</span>
                  <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                    <mat-icon class="scale-75">person</mat-icon>
                  </div>
                </button>

                <mat-menu #userMenu="matMenu">
                  <button mat-menu-item class="text-red-600" (click)="onLogout()">
                    <mat-icon class="text-red-600">logout</mat-icon>
                    <span>Logout</span>
                  </button>
                </mat-menu>
              } @else {
                <a routerLink="/login" mat-button color="primary" class="font-semibold">Login</a>
              }
            </div>

          </div>
        </div>
      </nav>

      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <footer class="border-t border-slate-100 py-10 bg-slate-50/50">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <div class="flex justify-center items-center gap-2 mb-4">
            <span class="text-sm font-bold text-slate-800">AnimeRec</span>
          </div>
          <p class="text-xs text-slate-400 mb-4">
            Built with Angular, Tailwind, Express, MongoDB, and OpenAI's API. This project is a demonstration of a full-stack anime recommendation system.
          </p>
          <div class="flex justify-center gap-6">
            <a routerLink="/about" class="text-xs text-slate-500 hover:text-blue-600 underline-offset-4 hover:underline">About Me</a>
            <span class="text-slate-300">|</span>
            <span class="text-xs text-slate-400">© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class MainLayout {
  private authService = inject(AuthService);
  userDisplayName = signal<string | null>(null);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      this.userDisplayName.set(user?.displayName || null);
    });
  }

  onLogout() {
    this.authService.signOut();
  }
}