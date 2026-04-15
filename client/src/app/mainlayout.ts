import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule
  ],
  template: `
    <div class="flex flex-col min-h-screen bg-white">
      
      <nav class="sticky top-0 z-100 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16 items-center">
            
            <div class="flex items-center gap-2 cursor-pointer" routerLink="/">
              <mat-icon class="text-blue-600 shrink-0">movie_filter</mat-icon>
              <span class="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                anime<span class="text-blue-600">Recommendation</span>
              </span>
            </div>

            <div class="flex items-center gap-6">
              <a routerLink="/"
                [routerLinkActive]="['!text-blue-600', 'font-semibold']"
                [routerLinkActiveOptions]="{ exact: true }"
                ariaCurrentWhenActive="page"
                class="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Discover</a>
              <a routerLink="/random"
                [routerLinkActive]="['!text-blue-600', 'font-semibold']"
                ariaCurrentWhenActive="page"
                class="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Random</a>
            </div>
          </div>
        </div>
      </nav>

      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <footer class="border-t border-slate-200 py-8 bg-slate-50">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <p class="text-sm font-semibold text-slate-800 mb-2">
            anime<span class="text-blue-600">Recommendation</span>
          </p>
          <p class="text-xs text-slate-500 mb-4">
            Built with Angular, Tailwind, Node.js, MongoDB Atlas Vector Search, and OpenAI.
          </p>
          <div class="flex justify-center items-center gap-4 text-xs text-slate-500">
            <a href="https://github.com/fkvivid/anime-recommendation" target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 underline-offset-4 hover:underline">GitHub</a>
            <span class="text-slate-300">|</span>
            <a href="https://anime.vividtemka.com" target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 underline-offset-4 hover:underline">Live Demo</a>
            <span class="text-slate-300">|</span>
            <span>© {{ currentYear }} fkvivid</span>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class MainLayout {
  protected readonly currentYear = new Date().getFullYear();
}
