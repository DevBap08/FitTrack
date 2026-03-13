import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.maxLength(71)]]
  });

  isLoading = signal(false);
  error: string | null = null;

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.error = null;
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err.status === 401) {
            this.error = 'Invalid username or password';
          } else if (err.status === 0 || err.status >= 500) {
            this.error = 'Server is sleeping or unreachable. Please try again in a few seconds.';
          } else {
            this.error = 'An unexpected error occurred. Please try again.';
          }
          console.error('Login error', err);
        }
      });
    }
  }
}
