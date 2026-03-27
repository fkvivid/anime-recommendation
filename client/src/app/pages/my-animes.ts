import { Component, inject, signal, effect, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AnimeService } from '../services/anime-service';
import { Anime, WatchedAnime } from '../types';
import { UserAnimeService } from '../services/user-anime-service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-animes',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="min-h-screen bg-[#f8fafc] py-8 sm:py-12 px-4 sm:px-6">
      
      <div class="max-w-7xl mx-auto mb-6 sm:mb-10 flex justify-between items-end">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">My Anime Library</h1>
        </div>
      </div>

      <div class="max-w-7xl mx-auto">
        
        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-32 gap-4">
            <mat-spinner diameter="40"></mat-spinner>
            <p class="text-slate-400 text-sm animate-pulse">Fetching animes...</p>
          </div>
        }

        @if (!isLoading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-8">
            @for (item of animes(); track item.anime.mal_id) {
              <div
                role="link"
                tabindex="0"
                (click)="openMyAnimeList(item.anime.mal_id)"
                (keyup.enter)="openMyAnimeList(item.anime.mal_id)"
                [attr.aria-label]="'Open ' + item.anime.title + ' on MyAnimeList'"
                class="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div class="aspect-[3/4] relative overflow-hidden bg-slate-100">
                  <img [src]="item.anime.image_url" [alt]="item.anime.title" loading="lazy" class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500">
                  
                  <div class="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-white text-xs font-bold">
                    ★ {{ item.anime.score }}
                  </div>
                </div>
                
                <div class="p-4">
                  <h3 class="font-bold text-slate-800 truncate mb-1">{{ item.anime.title }}</h3>
                  <div class="flex justify-between items-center">
                    <div class="flex gap-2 flex-wrap">
                    @for (genre of item.anime.genres; track genre; let i = $index) {
                        @if (i < 1) {
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
                    <span class="text-[10px] uppercase font-bold tracking-widest text-blue-500 bg-slate-100 px-2 py-1 rounded">
                        {{ item.status }}
                    </span>
                    <button mat-icon-button (click)="$event.stopPropagation(); toggleFavorite(item._id)" class="scale-75 text-slate-300 hover:text-red-500">
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          @if (animes().length === 0) {
            <div class="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <mat-icon class="text-slate-300 scale-[2] mb-4">search_off</mat-icon>
              <p class="text-slate-500">No animes found in this dimension.</p>
            </div>
          }
        }

        <div class="mt-12 border-t border-slate-100 pt-6">
          <mat-paginator 
            [length]="totalItems()"
            [pageSize]="pageSize()"
            [pageSizeOptions]="[8, 12, 24]"
            [pageIndex]="currentPage()"
            (page)="handlePageEvent($event)"
            aria-label="Select page">
          </mat-paginator>
        </div>

      </div>
    </div>
  `
})
export class MyAnimes {
  private userAnimeService = inject(UserAnimeService);

  animes = signal<WatchedAnime[]>([]);
  totalItems = signal(100);
  isLoading = signal(false);
  snackbar = inject(MatSnackBar);

  currentPage = signal(0);
  pageSize = signal(12);

  constructor() {
    effect(() => {
      this.fetchAnimes();
    });
  }

  fetchAnimes() {
    this.isLoading.set(true);

    this.userAnimeService.getUserAnime(this.currentPage(), this.pageSize())
      .subscribe({
        next: (response) => {
          this.animes.set(response.data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load animes:', err);
          this.isLoading.set(false);
        }
      });
  }

  handlePageEvent(e: PageEvent) {
    this.currentPage.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
  }

  openMyAnimeList(malId: number) {
    if (malId == null || Number.isNaN(malId)) return;
    window.open(`https://myanimelist.net/anime/${malId}`, '_blank', 'noopener,noreferrer');
  }

  toggleFavorite(id: string) {
    this.userAnimeService.remove(id).subscribe({
      next: () => {
        this.snackbar.open('Anime removed from watchlist!', 'Close', { duration: 2000 });
        this.fetchAnimes();
      },
      error: (err) => {
        this.snackbar.open('Failed to remove anime from watchlist.', 'Close', { duration: 2000 });
      }
    });
  }
}