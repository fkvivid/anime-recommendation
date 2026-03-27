import { Component, inject, signal, effect, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AnimeService } from '../services/anime-service';
import { Anime, WatchStatus } from '../types';
import { UserAnimeService } from '../services/user-anime-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { WatchStatusDialog } from '../components/watch-status-dialog';

@Component({
    selector: 'app-animes',
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
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">Anime Library</h1>
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
            @for (anime of animes(); track anime.mal_id) {
              <div class="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div class="aspect-[3/4] relative overflow-hidden bg-slate-100">
                  <img [src]="anime.image_url" [alt]="anime.title" loading="lazy" class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500">
                  
                  <div class="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-white text-xs font-bold">
                    ★ {{ anime.score }}
                  </div>
                </div>
                
                <div class="p-4">
                  <h3 class="font-bold text-slate-800 truncate mb-1">{{ anime.title }}</h3>
                  <div class="flex justify-between items-center">
                    <div class="flex gap-2 flex-wrap">
                    @for (genre of anime.genres; track genre; let i = $index) {
                        @if (i < 2) {
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
                    <button 
                        mat-icon-button 
                        (click)="openWatchlistDialog(anime)" 
                        class="scale-75 text-slate-400 hover:text-blue-600 transition-colors"
                        matTooltip="Add to Watchlist">
                        <mat-icon>playlist_add</mat-icon>
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
export class Animes {
    private animeService = inject(AnimeService);
    private userAnimeService = inject(UserAnimeService);
    private dialog = inject(MatDialog);

    animes = signal<Anime[]>([]);
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

        this.animeService.getAnimes(this.currentPage() + 1, this.pageSize())
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

    openWatchlistDialog(anime: any) {
        const dialogRef = this.dialog.open(WatchStatusDialog, {
            data: {
                title: anime.title,
                status: "watching"
            },
            width: '400px',
            panelClass: 'custom-dialog-container'
        });

        dialogRef.afterClosed().subscribe((result: WatchStatus | undefined) => {
            if (result) {
                this.updateWatchlist(anime.mal_id, result);
            }
        });
    }

    updateWatchlist(animeId: number, status: WatchStatus) {
        this.userAnimeService.add({ animeId, status }).subscribe({
            next: () => {
                this.snackbar.open(`Status updated to ${status}`, 'OK', { duration: 3000 });
                this.fetchAnimes();
            },
            error: (err) => {
                console.error(err);
                this.snackbar.open('Could not update watchlist.', 'Dismiss');
            }
        });
    }
}