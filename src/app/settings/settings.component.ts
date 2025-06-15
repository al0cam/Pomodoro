import { CommonModule, NgIf } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { SettingsService } from "../services/settings.service";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf],
  template: `
<div class="min-h-[70dvh] card bg-base-200 shadow-2xl max-w-4xl mx-auto">
  <div class="card-body p-8 md:p-12">
    <!-- Header Section -->
    <div class="text-center mb-12">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6">
        <svg class="w-8 h-8 text-primary-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h2 class="text-4xl md:text-5xl font-bold text-base-content mb-3">
        Timer Settings
      </h2>
      <p class="text-base-content/70 text-lg">Customize your pomodoro experience</p>
    </div>

    <!-- Settings Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      <!-- Pomodoro Duration -->
      <div class="card bg-error/10 border border-error/20 hover:shadow-lg transition-all duration-300">
        <div class="card-body p-6">
          <div class="flex items-center mb-4">
            <div class="min-w-0">
              <h3 class="text-lg font-semibold text-base-content">Focus Time</h3>
              <p class="text-base-content/60 text-sm">Work session duration</p>
            </div>
          </div>
          <div class="form-control">
            <div class="input-group">
              <input
                type="number"
                [(ngModel)]="pomodoroInput"
                (change)="updatePomodoroDuration()"
                name="pomodoroInput"
                min="1"
                class="input input-bordered input-error w-full bg-base-100"
                placeholder="25"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Short Break Duration -->
      <div class="card bg-success/10 border border-success/20 hover:shadow-lg transition-all duration-300">
        <div class="card-body p-6">
          <div class="flex items-center mb-4">
            <div class="min-w-0">
              <h3 class="text-lg font-semibold text-base-content">Short Break</h3>
              <p class="text-base-content/60 text-sm">Quick rest period</p>
            </div>
          </div>
          <div class="form-control">
            <div class="input-group">
              <input
                type="number"
                [(ngModel)]="shortBreakInput"
                (change)="updateShortBreakDuration()"
                name="shortBreakInput"
                min="1"
                class="input input-bordered input-success w-full bg-base-100"
                placeholder="5"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Long Break Duration -->
      <div class="card bg-info/10 border border-info/20 hover:shadow-lg transition-all duration-300">
        <div class="card-body p-6">
          <div class="flex items-center mb-4">
            <div class="min-w-0">
              <h3 class="text-lg font-semibold text-base-content">Long Break</h3>
              <p class="text-base-content/60 text-sm">Extended rest period</p>
            </div>
          </div>
          <div class="form-control">
            <div class="input-group">
              <input
                type="number"
                [(ngModel)]="longBreakInput"
                (change)="updateLongBreakDuration()"
                name="longBreakInput"
                min="1"
                class="input input-bordered input-info w-full bg-base-100"
                placeholder="15"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div *ngIf="message()" class="text-center mb-8">
      <div class="alert alert-success max-w-md mx-auto">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>{{ message() }}</span>
      </div>
    </div>

    <!-- Back Button -->
    <div class="text-center">
      <button (click)="goBack()" class="btn btn-primary btn-lg gap-2 hover:scale-105 transition-transform">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Pomodoro
      </button>
    </div>
  </div>
</div>

  `,
  styles: [],
})
export class SettingsComponent implements OnInit {
  pomodoroInput = signal<number>(0);
  shortBreakInput = signal<number>(0);
  longBreakInput = signal<number>(0);
  message = signal<string | null>(null);

  constructor(
    private settingsService: SettingsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.pomodoroInput.set(this.settingsService.pomodoroDuration());
    this.shortBreakInput.set(this.settingsService.shortBreakDuration());
    this.longBreakInput.set(this.settingsService.longBreakDuration());
  }

  updatePomodoroDuration(): void {
    const value = this.pomodoroInput();
    if (value && value > 0) {
      this.settingsService.setPomodoroDuration(value);
      this.message.set("Settings updated successfully!");
      setTimeout(() => this.message.set(null), 3000);
    } else {
      this.message.set("Pomodoro duration must be a positive number.");
    }
  }

  updateShortBreakDuration(): void {
    const value = this.shortBreakInput();
    if (value && value > 0) {
      this.settingsService.setShortBreakDuration(value);
      this.message.set("Settings updated successfully!");
      setTimeout(() => this.message.set(null), 3000);
    } else {
      this.message.set("Short Break duration must be a positive number.");
    }
  }

  updateLongBreakDuration(): void {
    const value = this.longBreakInput();
    if (value && value > 0) {
      this.settingsService.setLongBreakDuration(value);
      this.message.set("Settings updated successfully!");
      setTimeout(() => this.message.set(null), 3000);
    } else {
      this.message.set("Long Break duration must be a positive number.");
    }
  }

  goBack(): void {
    this.router.navigate(["/"]);
  }
}
