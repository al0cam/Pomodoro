import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  pomodoroDuration = signal<number>(
    this.getStoredSetting("pomodoroDuration", 25),
  );
  shortBreakDuration = signal<number>(
    this.getStoredSetting("shortBreakDuration", 5),
  );
  longBreakDuration = signal<number>(
    this.getStoredSetting("longBreakDuration", 15),
  );

  constructor() {}

  private getStoredSetting(key: string, defaultValue: number): number {
    const storedValue = localStorage.getItem(key);
    const parsedValue = storedValue
      ? Number.parseInt(storedValue, 10)
      : defaultValue;
    return parsedValue;
  }

  setPomodoroDuration(minutes: number): void {
    if (minutes > 0) {
      this.pomodoroDuration.set(minutes);
      localStorage.setItem("pomodoroDuration", minutes.toString());
    } else {
      console.warn(`SettingsService: Invalid pomodoro duration: ${minutes}`);
    }
  }

  setShortBreakDuration(minutes: number): void {
    if (minutes > 0) {
      this.shortBreakDuration.set(minutes);
      localStorage.setItem("shortBreakDuration", minutes.toString());
    } else {
      console.warn(`SettingsService: Invalid short break duration: ${minutes}`);
    }
  }

  setLongBreakDuration(minutes: number): void {
    if (minutes > 0) {
      this.longBreakDuration.set(minutes);
      localStorage.setItem("longBreakDuration", minutes.toString());
    } else {
      console.warn(`SettingsService: Invalid long break duration: ${minutes}`);
    }
  }
}
