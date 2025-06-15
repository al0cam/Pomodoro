import { CommonModule, NgIf } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { AuthService } from "./services/auth.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, NgIf, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-700 flex flex-col items-center justify-center py-10 px-4 font-inter text-white">
      <div class="card bg-base-100 shadow-xl rounded-3xl p-8 max-w-2xl w-full">
        <!-- Header with Settings Button and Auth Controls -->
        <div class="flex justify-between items-center mb-4">
          <!-- Settings Button (Top Left) -->
          <button (click)="navigateToSettings()" class="btn btn-sm btn-ghost text-gray-300 hover:text-white" aria-label="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.125 1.125 0 011.924 0c1.756.426 1.756 2.924 0 3.35a1.125 1.125 0 010 1.924c-1.756.426-1.756 2.924 0 3.35a1.125 1.125 0 010 1.924c-1.756.426-1.756 2.924 0 3.35a1.125 1.125 0 011.924 0c1.756-.426 2.924-.426 3.35 0a1.125 1.125 0 010-1.924c-1.756-.426-1.756-2.924 0-3.35a1.125 1.125 0 010-1.924c1.756-.426 1.756-2.924 0-3.35a1.125 1.125 0 01-1.924 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <!-- Auth Status & Controls (Top Right) -->
          <div class="flex space-x-2">
            <div *ngIf="authService.isAuthenticated(); else loginRegisterSection">
              <button (click)="logout()" class="btn btn-sm btn-outline btn-error">Logout</button>
            </div>
            <ng-template #loginRegisterSection>
              <div class="flex space-x-2">
                <button (click)="navigateToLogin()" class="btn btn-sm btn-outline btn-primary">Login</button>
                <button (click)="navigateToRegister()" class="btn btn-sm btn-primary">Register</button>
              </div>
            </ng-template>
          </div>
        </div>

        <router-outlet></router-outlet>

      </div>
    </div>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void { }

  navigateToLogin(): void {
    this.router.navigate(["/login"]);
  }

  navigateToRegister(): void {
    this.router.navigate(["/register"]);
  }

  navigateToSettings(): void {
    this.router.navigate(["/settings"]);
  }

  logout(): void {
    this.authService.logout();
  }
}
