import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnimeService } from '../services/anime-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Anime } from '../types';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="flex flex-col min-h-screen bg-slate-50">
      
      <section class="relative flex-1 flex items-center justify-center overflow-hidden">
        
        <div class="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Anime Background" 
            class="w-full h-full object-cover"
          >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
        </div>

        <div class="z-10 w-full max-w-3xl px-6 text-center">
          <h1 class="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-2xl">
            Find Your Next <span class="text-blue-400">Masterpiece</span>
          </h1>
          
          <p class="text-slate-300 text-lg md:text-xl mb-10 max-w-xl mx-auto drop-shadow-md font-medium">
          Search for an anime you love, and let our AI recommend hidden gems that match your vibe.
          </p>

          <div class="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-2xl">
            <input 
              [(ngModel)]="searchQuery" 
              type="text"
              placeholder="e.g. &quot;something like Attack on Titan but more emotional&quot;"
              (keyup.enter)="onSearch()"
              class="flex-1 bg-white/20 text-white placeholder-white/50 px-4 py-3 rounded-xl outline-none border border-white/30 focus:border-white/50 transition backdrop-blur-sm"
            >

            <button 
              mat-flat-button 
              color="primary" 
              (click)="onSearch()"
              [disabled]="isLoading()"
              class="h-12 px-8 font-bold rounded-xl transition-all hover:scale-105 active:scale-95">
              @if (isLoading()) {
                <span>Searching...</span>
              } @else {
                FIND
              }
            </button>
          </div>
        </div>
      </section>

      <main class="flex-1 container mx-auto px-6 py-12" *ngIf="isLoading() || animeResults().length > 0">
        
        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-24 gap-4">
            <mat-spinner diameter="50" strokeWidth="4"></mat-spinner>
            <p class="text-slate-500 font-medium animate-pulse">Scanning the multiverse...</p>
          </div>
        }

        @if (!isLoading() && animeResults().length > 0) {
          <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 class="text-3xl font-extrabold text-slate-900">Top 9 Picks</h2>
              <p class="text-slate-500 mt-1 italic">"{{ searchQuery() }}" matches found</p>
            </div>
            <div class="h-1 grow mx-8 bg-slate-200 rounded-full hidden md:block"></div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            @for (anime of animeResults(); track anime.mal_id) {
              <div class="group relative bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer border border-slate-100 hover:-translate-y-2">
                
                <div class="aspect-16/10 overflow-hidden">
                  <img 
                    [src]="anime.image_url" 
                    [alt]="anime.title" 
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  >
                  <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    <span class="text-yellow-500">★</span> {{ anime.score }}
                  </div>
                </div>

                <div class="p-6">
                  <h3 class="text-xl font-bold text-slate-800 line-clamp-1 mb-2">
                    {{ anime.title }}
                  </h3>
                  <div class="flex gap-2">
                    <div class="flex gap-2 flex-wrap">
                      @for (genre of anime.genres; track genre; let i = $index) {
                        @if (i < 3) {
                          <span class="text-[10px] uppercase font-bold tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {{ genre }}
                          </span>
                        }
                      } @empty {
                        <span class="text-[10px] uppercase font-bold tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          N/A
                        </span>
                      }
                    </div>
                  </div>
                </div>
                
                <div class="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [``]
})
export class Homepage {
  searchQuery = signal('');
  isLoading = signal(false);
  animeResults = signal<Anime[]>([]);
  animeService = inject(AnimeService);
  snackBar = inject(MatSnackBar);
  router = inject(Router);
  authService = inject(AuthService);

  onSearch() {
    if (!this.searchQuery().trim()) return;
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Please log in to get recommendations!', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }
    this.isLoading.set(true);

    this.animeService.recommend(this.searchQuery()).subscribe({
      next: (response) => {
        this.animeResults.set(response.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Recommendation error:', error);
        this.snackBar.open('Failed to fetch recommendations. Please try again.', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });

  }
}