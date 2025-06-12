import { CommonModule, NgIf } from "@angular/common";
import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { LoginRequest } from "../../interfaces/auth.interface";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center py-10 px-4 font-inter text-white">
      <div class="card bg-transparent shadow-none rounded-3xl p-8 max-w-md w-full border border-white/20 backdrop-blur-sm">
        <div class="card-body text-center">
          <h2 class="card-title text-3xl font-bold text-white mb-6 justify-center">Login</h2>

          <form (ngSubmit)="onLogin()" class="space-y-4">
            <label class="form-control w-full">
              <div class="label">
                <span class="label-text text-white">Email</span>
              </div>
              <input
                type="email"
                placeholder="you@example.com"
                [(ngModel)]="loginCredentials.email"
                name="email"
                required
                class="input input-bordered input-primary w-full bg-white/10 border-white/30 text-white placeholder-gray-300"
              />
            </label>

            <label class="form-control w-full">
              <div class="label">
                <span class="label-text text-white">Password</span>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                [(ngModel)]="loginCredentials.password"
                name="password"
                required
                class="input input-bordered input-primary w-full bg-white/10 border-white/30 text-white placeholder-gray-300"
              />
            </label>

            <div *ngIf="loginError()" class="alert alert-error text-sm text-center">
              {{ loginError() }}
            </div>

            <button type="submit" class="btn btn-primary w-full mt-6" [disabled]="isLoggingIn()">
              <span *ngIf="!isLoggingIn()">Login</span>
              <span *ngIf="isLoggingIn()" class="loading loading-spinner"></span>
            </button>
          </form>

          <p class="text-sm text-white mt-4">
            Don't have an account? <a routerLink="/register" class="link link-accent hover:link-primary">Register here</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class LoginComponent {
  loginCredentials: LoginRequest = { email: "", password: "" };
  loginError = signal<string | null>(null);
  isLoggingIn = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onLogin(): void {
    this.isLoggingIn.set(true);
    this.loginError.set(null);

    this.authService.login(this.loginCredentials).subscribe({
      next: () => {
        this.router.navigate(["/"]);
      },
      error: (err) => {
        console.error("Login error:", err);
        this.loginError.set(
          err.message || "An unknown error occurred during login.",
        );
        this.isLoggingIn.set(false);
      },
      complete: () => {
        this.isLoggingIn.set(false);
      },
    });
  }
}
