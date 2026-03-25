import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
      <div class="relative mb-8">
        <h1 class="text-9xl font-extrabold text-slate-200 tracking-widest select-none">
          404
        </h1>
        <div class="absolute inset-0 flex items-center justify-center">
          <p class="bg-blue-600 text-white px-3 py-1 text-sm rounded rotate-12 font-mono">
            PAGE NOT FOUND
          </p>
        </div>
      </div>

      <div class="max-w-md">
        <h2 class="text-3xl font-bold text-slate-800 mb-4">
          Lost in the Multiverse?
        </h2>
        <p class="text-slate-600 mb-8 leading-relaxed">
          The page you're looking for doesn't exist. It might have been removed, renamed, or is temporarily unavailable.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a mat-flat-button color="primary" [routerLink]="['/']" class="px-8 py-2">
            <mat-icon class="mr-2">home</mat-icon>
            BACK TO HOME
          </a>
        </div>
      </div>
    </div>
  `
})
export class NotFound {
}