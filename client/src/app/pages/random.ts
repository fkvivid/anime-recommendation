import { Component, inject, signal } from '@angular/core';
import confetti from 'canvas-confetti';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnimeService } from '../services/anime-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Anime } from '../types';

@Component({
  selector: 'app-random',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="flex flex-col min-h-screen bg-slate-50">
      
      <section class="relative flex-1 flex flex-col items-center justify-center overflow-hidden min-h-[50vh]">
        
        <div class="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Anime Background" 
            class="w-full h-full object-cover"
          >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
        </div>

        <div class="z-10 w-full max-w-3xl px-4 sm:px-6 text-center py-14 sm:py-20">
          <h1 class="text-3xl sm:text-4xl md:text-7xl font-black text-white mb-4 sm:mb-6 tracking-tight drop-shadow-2xl">
            Discover a <span class="text-blue-400">Random Gem</span>
          </h1>
          
          <p class="text-slate-300 text-base sm:text-lg md:text-xl mb-6 sm:mb-10 max-w-xl mx-auto drop-shadow-md font-medium">
          Let fate decide your next anime masterpiece.
          </p>

          <div class="flex justify-center">
            <button 
              mat-flat-button 
              color="primary" 
              (click)="onRandomize()"
              [disabled]="isLoading()"
              class="h-14 px-10 rounded-2xl transition-all hover:scale-105 active:scale-95 bg-blue-600 hover:bg-blue-500 text-white shadow-2xl font-bold flex items-center justify-center">
              @if (isLoading()) {
                <span>Rolling...</span>
              } @else {
                <span class="flex items-center gap-2">RANDOMIZE <mat-icon fontIcon="casino"></mat-icon></span>
              }
            </button>
          </div>
        </div>
      </section>

      <main class="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12" *ngIf="isLoading() || animeResult()">
        
        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-24 gap-4">
            <mat-spinner diameter="50" strokeWidth="4"></mat-spinner>
            <p class="text-slate-500 font-medium animate-pulse">Consulting the oracle...</p>
          </div>
        }

        @if (!isLoading() && animeResult()) {
          <div class="flex flex-col md:items-center justify-center mb-12 gap-4">
            <h2 class="text-3xl font-extrabold text-slate-900 text-center">Your Random Pick</h2>
          </div>

          <div class="max-w-sm mx-auto">
            <div
              role="link"
              tabindex="0"
              (click)="openMyAnimeListFromResult()"
              (keyup.enter)="openMyAnimeListFromResult()"
              [attr.aria-label]="'Open ' + animeResult()?.title + ' on MyAnimeList'"
              class="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer border border-slate-100 hover:-translate-y-2"
            >
              
              <div class="aspect-[3/4] overflow-hidden bg-slate-100">
                <img 
                  [src]="animeResult()?.image_url" 
                  [alt]="animeResult()?.title" 
                  loading="lazy"
                  class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                >
                <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  <span class="text-yellow-500">★</span> {{ animeResult()?.score || 'N/A' }}
                </div>
              </div>

              <div class="p-4 sm:p-6">
                <h3 class="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                  {{ animeResult()?.title }}
                </h3>
                <p class="text-sm text-slate-500 italic mb-4">
                  {{ animeResult()?.title_english || animeResult()?.title_japanese }}
                </p>

                <div class="flex gap-2 mb-6 flex-wrap">
                  @for (genre of animeResult()?.genres; track genre) {
                    <span class="text-xs uppercase font-bold tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {{ genre }}
                    </span>
                  }
                </div>

                <p class="text-slate-600 line-clamp-4 leading-relaxed">
                  {{ animeResult()?.synopsis }}
                </p>
              </div>
              
              <div class="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [``]
})
export class RandomPage {
  isLoading = signal(false);
  animeResult = signal<Anime | null>(null);
  animeService = inject(AnimeService);
  snackBar = inject(MatSnackBar);

  openMyAnimeListFromResult() {
    const malId = this.animeResult()?.mal_id;
    if (malId == null || Number.isNaN(malId)) return;
    window.open(`https://myanimelist.net/anime/${malId}`, '_blank', 'noopener,noreferrer');
  }

  onRandomize() {
    this.isLoading.set(true);
    this.animeResult.set(null); // Clear previous immediately

    this.animeService.getRandom().subscribe({
      next: (response) => {
        if (response.data) {
          this.animeResult.set(response.data);
          queueMicrotask(() => {
            void confetti({
              particleCount: 140,
              spread: 80,
              origin: { y: 0.55 },
              colors: ['#2563eb', '#93c5fd', '#fbbf24', '#fef08a']
            });
          });
        } else {
          this.snackBar.open('No anime found!', 'Close', { duration: 3000 });
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Randomize error:', error);
        this.snackBar.open('Failed to fetch a random anime. Please try again.', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }
}
