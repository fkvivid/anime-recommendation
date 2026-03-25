import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { WatchStatus } from '../types';

@Component({
  selector: 'app-watch-status-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule, FormsModule],
  template: `
    <div class="p-2">
      <h2 mat-dialog-title class="font-black! text-slate-800 text-xl!">Update Status</h2>
      <mat-dialog-content class="pt-2">
        <p class="text-xs text-slate-500 mb-6 uppercase tracking-widest font-bold">
          {{ data.title }}
        </p>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Select Progress</mat-label>
          <mat-select [(ngModel)]="selectedStatus">
            <mat-option value="watching">Currently Watching</mat-option>
            <mat-option value="completed">Completed</mat-option>
            <mat-option value="on_hold">On Hold</mat-option>
            <mat-option value="dropped">Dropped</mat-option>
            <mat-option value="plan_to_watch">Plan to Watch</mat-option>
          </mat-select>
        </mat-form-field>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end" class="pb-4 px-6 gap-2">
        <button mat-button mat-dialog-close class="text-slate-500 font-semibold">CANCEL</button>
        <button mat-flat-button color="primary" [mat-dialog-close]="selectedStatus()" class="px-6 font-bold">
          SAVE CHANGES
        </button>
      </mat-dialog-actions>
    </div>
  `
})
export class WatchStatusDialog {
  readonly data = inject(MAT_DIALOG_DATA);
  selectedStatus = signal<WatchStatus>(this.data.status || 'watching');
}