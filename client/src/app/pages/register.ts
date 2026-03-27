import { Component, inject, signal } from '@angular/core';
import { Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  template: `
    <div 
      class="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style="background-image: url('https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');"
    >
      
      <div class="absolute inset-0 bg-black/50 z-0"></div>

      <div class="max-w-md w-full bg-white rounded-xl shadow-2xl p-5 sm:p-8 border border-slate-200 z-10 relative">
        
        <div class="text-center mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-800">Create Account</h1>
          <p class="text-slate-500 mt-2">Join the Anime Recommender</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email Address</mat-label>
            <input matInput formControlName="email" type="email" placeholder="john@example.com">
            <mat-icon matSuffix>email</mat-icon>
            @if (registerForm.get('email')?.hasError('email')) {
              <mat-error>Please enter a valid email</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password">
            <button mat-icon-button matSuffix (click)="togglePassword($event)" type="button">
              <mat-icon>{{hidePassword() ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            @if (registerForm.get('password')?.hasError('minlength')) {
              <mat-error>Minimum 8 characters required</mat-error>
            }
          </mat-form-field>

          <button 
            mat-flat-button 
            color="primary" 
            type="submit" 
            [disabled]="registerForm.invalid"
            class="py-6 mt-2 text-lg font-semibold tracking-wide">
            SIGN UP
          </button>

          <div class="text-center mt-4">
            <span class="text-slate-600 text-sm">Already have an account?</span>
            <a [routerLink]="['/login']" class="text-blue-600 hover:underline text-sm font-medium ml-1">Log in</a>
          </div>

        </form>
      </div>
    </div>
  `
})
export class Register {
  hidePassword = signal(true);
  authService = inject(AuthService);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  registerForm = inject(FormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      this.authService.signUp({ email: email!, password: password! }).subscribe({
        next: () => {
          this.snackBar.open('Registration successful! Please log in.', 'Close', { duration: 3000 });
          this.router.navigate(['/login']);
        },
        error: (err: { error: { error: unknown; }; }) => {
          console.error('Registration error:', err);
          this.snackBar.open(`Registration failed: ${err?.error?.error || 'Unknown error'}`, 'Close', { duration: 3000 });
        }
      });
    }
  }

  togglePassword(event: MouseEvent) {
    this.hidePassword.update(prev => !prev);
    event.preventDefault();
  }
}