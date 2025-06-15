import { CommonModule, NgIf } from "@angular/common";
import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import type { RegisterRequest } from "../../interfaces/auth.interface";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, RouterLink],
  template: `
    <div class="min-h-[70dvh] flex items-center justify-center py-10 px-4 font-inter text-white">
      <div class="card bg-transparent shadow-none rounded-3xl p-8 max-w-md w-full border border-white/20 backdrop-blur-sm">
        <div class="card-body text-center">
          <h2 class="card-title text-3xl font-bold text-white mb-6 justify-center">Register</h2>

          <form (ngSubmit)="onRegister()" class="space-y-4">
            <label class="form-control w-full">
              <div class="label">
                <span class="label-text text-white">Email</span>
              </div>
              <input
                type="email"
                placeholder="you@example.com"
                [(ngModel)]="registerCredentials.email"
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
                [(ngModel)]="registerCredentials.password"
                name="password"
                required
                class="input input-bordered input-primary w-full bg-white/10 border-white/30 text-white placeholder-gray-300"
              />
            </label>

            <label class="form-control w-full">
              <div class="label">
                <span class="label-text text-white">Confirm Password</span>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                [(ngModel)]="registerCredentials.confirmPassword"
                name="confirmPassword"
                required
                class="input input-bordered input-primary w-full bg-white/10 border-white/30 text-white placeholder-gray-300"
              />
            </label>

            <div *ngIf="registerError()" class="alert alert-error text-sm text-center">
              {{ registerError() }}
            </div>

            <button type="submit" class="btn btn-primary w-full mt-6" [disabled]="isRegistering()">
              <span *ngIf="!isRegistering()">Register</span>
              <span *ngIf="isRegistering()" class="loading loading-spinner"></span>
            </button>
          </form>

          <p class="text-sm text-white mt-4">
            Already have an account? <a routerLink="/login" class="link link-accent hover:link-primary">Login here</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class RegisterComponent {
  registerCredentials: RegisterRequest = {
    email: "",
    password: "",
    confirmPassword: "",
  };
  registerError = signal<string | null>(null);
  isRegistering = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  onRegister(): void {
    this.isRegistering.set(true);
    this.registerError.set(null);

    if (
      this.registerCredentials.password !==
      this.registerCredentials.confirmPassword
    ) {
      this.registerError.set("Passwords do not match.");
      this.isRegistering.set(false);
      return;
    }

    this.authService.register(this.registerCredentials).subscribe({
      next: () => {
        this.router.navigate(["/login"]);
      },
      error: (err) => {
        console.error("Registration error:", err);
        this.registerError.set(
          err.message || "An unknown error occurred during registration.",
        );
        this.isRegistering.set(false);
      },
      complete: () => {
        this.isRegistering.set(false);
      },
    });
  }
}
