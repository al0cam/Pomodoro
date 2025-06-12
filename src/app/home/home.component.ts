import { CommonModule, NgFor, NgIf } from "@angular/common";
import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { TaskItem } from "../interfaces/task-item.interface";
import { AuthService } from "../services/auth.service";
import { SettingsService } from "../services/settings.service";
import { TaskItemService } from "../services/task-item.service";
import { TaskItemComponent } from "../task-item/task-item.component";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, TaskItemComponent],
  template: `
    <div class="card bg-base-100 shadow-xl rounded-3xl p-8 max-w-2xl w-full">
      <!-- Pomodoro Timer Section -->
      <div class="card-body text-center mb-8">
        <div class="flex justify-center items-center relative mb-6">
          <h1 class="text-4xl md:text-5xl font-extrabold text-white">Pomodoro</h1>
          <!-- Removed pencil icon as settings are now in a dedicated tab -->
        </div>

        <!-- Mode Selector Buttons -->
        <div class="flex justify-center space-x-3 mb-6">
          <button
            (click)="switchMode('pomodoro')"
            class="btn btn-sm sm:btn-md rounded-full font-semibold"
            [ngClass]="{'btn-primary': timerMode() === 'pomodoro', 'btn-ghost text-gray-300': timerMode() !== 'pomodoro'}"
          >
            Pomodoro
          </button>
          <button
            (click)="switchMode('shortBreak')"
            class="btn btn-sm sm:btn-md rounded-full font-semibold"
            [ngClass]="{'btn-primary': timerMode() === 'shortBreak', 'btn-ghost text-gray-300': timerMode() !== 'shortBreak'}"
          >
            Short Break
          </button>
          <button
            (click)="switchMode('longBreak')"
            class="btn btn-sm sm:btn-md rounded-full font-semibold"
            [ngClass]="{'btn-primary': timerMode() === 'longBreak', 'btn-ghost text-gray-300': timerMode() !== 'longBreak'}"
          >
            Long Break
          </button>
        </div>

        <!-- Timer Display -->
        <div class="text-7xl md:text-8xl font-bold text-primary-focus mb-6 tracking-tight">
          {{ formattedTime() }}
        </div>

        <!-- Timer Control Buttons -->
        <div class="flex justify-center space-x-4">
          <button
            (click)="toggleTimer()"
            class="btn btn-lg rounded-full text-white font-bold text-lg shadow-lg"
            [ngClass]="{'btn-error': isActive(), 'btn-success': !isActive()}"
          >
            {{ isActive() ? 'Pause' : 'Start' }}
          </button>
          <button
            (click)="resetTimer()"
            class="btn btn-lg rounded-full btn-warning text-white font-bold text-lg shadow-lg"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Task List Section -->
      <hr class="my-8 border-t-2 border-base-200" />

      <h2 class="text-3xl font-bold text-primary mb-6 text-center">Your Tasks</h2>

      <!-- Add New Task Button & Form (Conditional based on login and showAddTaskForm) -->
      <div *ngIf="authService.isAuthenticated()" class="mb-8">
        <div class="flex justify-center mb-4">
          <button
            (click)="toggleAddTaskForm()"
            class="btn btn-secondary text-white font-bold py-3 px-6 shadow-md rounded-full"
          >
            {{ showAddTaskForm() ? 'Hide Add Task Form' : 'Add New Task' }}
          </button>
        </div>

        <form *ngIf="showAddTaskForm()" (ngSubmit)="handleAddTask()" class="p-4 bg-base-200 rounded-lg shadow-inner">
          <input
            type="text"
            placeholder="Task Title (e.g., Finish report)"
            [(ngModel)]="newTaskTitle"
            name="newTaskTitle"
            required
            class="input input-bordered input-primary w-full p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-primary bg-white/10 border-white/30 text-white placeholder-gray-300"
          />
          <textarea
            placeholder="Task Description (optional)"
            [(ngModel)]="newTaskDesc"
            name="newTaskDesc"
            rows="2"
            class="textarea textarea-bordered textarea-primary w-full p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-primary resize-y bg-white/10 border-white/30 text-white placeholder-gray-300"
          ></textarea>
          <input
            type="number"
            placeholder="Estimated Pomodoros (e.g., 2)"
            [(ngModel)]="newTaskEstimatedPomodoros"
            name="newTaskEstimatedPomodoros"
            min="1"
            class="input input-bordered input-primary w-full p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-primary bg-white/10 border-white/30 text-white placeholder-gray-300"
          />
          <button
            type="submit"
            class="btn btn-primary w-full text-white font-bold py-3 px-4 shadow-md"
          >
            Add Task
          </button>
        </form>
      </div>

      <div *ngIf="!authService.isAuthenticated()" class="alert alert-info text-center mb-8 text-white">
        <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>Login or Register to create and manage tasks.</span>
      </div>


      <!-- Task List Display -->
      <div class="space-y-4">
        <p *ngIf="sortedTasks().length === 0" class="text-center text-gray-300 text-lg py-8">No tasks yet! Add one above to get started.</p>
        <app-task-item
          *ngFor="let task of sortedTasks(); trackBy: trackById"
          [task]="task"
          (toggleCompletion)="toggleTaskCompletion($event)"
          (toggleExpansion)="toggleTaskExpansion($event)"
          (deleteTask)="deleteTask($event)"
          (setActive)="setActiveTask($event)"
          (clearActive)="clearActiveTask($event)"
          [isActiveTask]="activeTaskId() === task.id"
          [allowEditDelete]="authService.isAuthenticated()"
        />
      </div>
    </div>
  `,
  styles: [],
})
export class HomeComponent implements OnInit, OnDestroy {
  private settingsService = inject(SettingsService);
  readonly currentTimerSettings = computed(() => {
    const pomodoro = this.settingsService.pomodoroDuration();
    const shortBreak = this.settingsService.shortBreakDuration();
    const longBreak = this.settingsService.longBreakDuration();
    return {
      pomodoro: pomodoro * 60,
      shortBreak: shortBreak * 60,
      longBreak: longBreak * 60,
    };
  });

  timerMode = signal<"pomodoro" | "shortBreak" | "longBreak">("pomodoro");
  timeLeft = signal<number>(this.currentTimerSettings().pomodoro);
  isActive = signal<boolean>(false);
  pomodoroCount = signal<number>(0);
  activeTaskId = signal<number | null>(this.getInitialActiveTaskId());

  private timerInterval: any;
  private authSubscription: Subscription | undefined;

  showAddTaskForm = signal<boolean>(false);

  formattedTime = computed(() => {
    const minutes = Math.floor(this.timeLeft() / 60);
    const remainingSeconds = this.timeLeft() % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  });

  private getInitialActiveTaskId(): number | null {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem("activeTaskId");
      if (stored) {
        const taskId = Number.parseInt(stored, 10);
        return !Number.isNaN(taskId) ? taskId : null;
      }
    }
    return null;
  }

  constructor(
    private taskItemService: TaskItemService,
    public authService: AuthService,
  ) {
    effect(() => {
      const currentActiveId = this.activeTaskId();
      if (currentActiveId !== null) {
        localStorage.setItem("activeTaskId", currentActiveId.toString());
      } else {
        localStorage.removeItem("activeTaskId");
      }
    });

    effect(() => {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      if (this.isActive() && this.timeLeft() > 0) {
        this.timerInterval = setInterval(() => {
          this.timeLeft.update((prevTime) => prevTime - 1);
        }, 1000);
      } else if (this.timeLeft() === 0) {
        clearInterval(this.timerInterval);
        alert(`${this.timerMode()} finished!`);

        if (this.timerMode() === "pomodoro") {
          if (this.activeTaskId() !== null) {
            const taskIdToUpdate = this.activeTaskId();
            const taskToIncrement = this.tasks().find(
              (t) => t.id === taskIdToUpdate,
            );

            if (taskToIncrement) {
              const updatedCompletedPomodoros =
                (taskToIncrement.completedPomodoros || 0) + 1;
              const updatedTask: Omit<TaskItem, "createdAt" | "isExpanded"> = {
                ...taskToIncrement,
                completedPomodoros: updatedCompletedPomodoros,
              };

              this.tasks.update((currentTasks) =>
                currentTasks.map((task) =>
                  task.id === taskIdToUpdate
                    ? { ...task, completedPomodoros: updatedCompletedPomodoros }
                    : task,
                ),
              );

              this.taskItemService
                .updateTask(taskIdToUpdate!, updatedTask)
                .subscribe({
                  next: () =>
                    console.log(
                      `Pomodoro completed for task ${taskIdToUpdate}. Completed pomodoros: ${updatedCompletedPomodoros}`,
                    ),
                  error: (err) =>
                    console.error(
                      `Failed to update completed pomodoros for task ${taskIdToUpdate}:`,
                      err,
                    ),
                });
            }
          }

          this.pomodoroCount.update((prevCount) => prevCount + 1);
          if (this.pomodoroCount() % 4 === 0) {
            this.switchMode("longBreak");
          } else {
            this.switchMode("shortBreak");
          }
        } else {
          this.switchMode("pomodoro");
        }
        this.isActive.set(false);
      }
    });

    effect(() => {
      if (!this.isActive()) {
        const currentMode = this.timerMode();
        this.timeLeft.set(this.currentTimerSettings()[currentMode]);
      }
    });
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.authToken$.subscribe((token) => {
      this.fetchTasks();

      if (!token) {
        this.showAddTaskForm.set(false);
        this.activeTaskId.set(null);
      }
    });

    this.resetTimer();
  }
  private restoreActiveTaskFromStorage(): void {
    const storedActiveTaskId = localStorage.getItem("activeTaskId");
    if (storedActiveTaskId) {
      const taskId = Number.parseInt(storedActiveTaskId, 10);
      if (!Number.isNaN(taskId)) {
        const taskExists = this.tasks().some((task) => task.id === taskId);
        if (taskExists) {
          this.activeTaskId.set(taskId);
        } else {
          localStorage.removeItem("activeTaskId");
        }
      }
    }
  }
  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleAddTaskForm(): void {
    this.showAddTaskForm.update((current) => !current);
    if (!this.showAddTaskForm()) {
      this.newTaskTitle.set("");
      this.newTaskDesc.set("");
      this.newTaskEstimatedPomodoros.set("");
    }
  }

  toggleTimer(): void {
    this.isActive.update((current) => !current);
  }

  resetTimer(): void {
    clearInterval(this.timerInterval);
    this.isActive.set(false);
    this.timerMode.set("pomodoro");
    this.timeLeft.set(this.currentTimerSettings().pomodoro);
    this.pomodoroCount.set(0);
  }

  switchMode(mode: "pomodoro" | "shortBreak" | "longBreak"): void {
    clearInterval(this.timerInterval);
    this.isActive.set(false);
    this.timerMode.set(mode);
    this.timeLeft.set(this.currentTimerSettings()[mode]);
  }

  tasks = signal<TaskItem[]>([]);

  newTaskTitle = signal<string>("");
  newTaskDesc = signal<string>("");
  newTaskEstimatedPomodoros = signal<string>("");

  setActiveTask(taskId: number): void {
    this.activeTaskId.set(taskId);
  }

  clearActiveTask(taskId: number): void {
    if (this.activeTaskId() === taskId) {
      this.activeTaskId.set(null);
    }
  }

  sortedTasks = computed(() => {
    const currentTasks = [...this.tasks()];
    return currentTasks.sort((a, b) => {
      if (this.activeTaskId() === a.id) return -1;
      if (this.activeTaskId() === b.id) return 1;

      if (a.isCompleted && !b.isCompleted) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  });

  fetchTasks(): void {
    this.taskItemService.getAllTasks().subscribe({
      next: (data) => {
        const fetchedTasks = data.map((task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueAt: task.dueAt ? new Date(task.dueAt) : undefined,
          isExpanded: false,
        }));
        this.tasks.set(fetchedTasks);

        this.restoreActiveTaskFromStorage();
      },
      error: (err) => {
        console.error("HomeComponent: Failed to fetch tasks:", err);
        this.tasks.set([]);
        if (err.status === 401 || err.status === 403) {
          console.warn(
            "HomeComponent: Unauthorized or Forbidden while fetching tasks. Logging out.",
          );
          this.authService.logout();
        }
      },
    });
  }

  handleAddTask(): void {
    const title = this.newTaskTitle().trim();
    if (!title) {
      console.log("HomeComponent: Task title is empty.");
      return;
    }
    if (!this.authService.isAuthenticated()) {
      alert("You must be logged in to create tasks.");
      return;
    }

    const taskPayload = {
      title: title,
      description: this.newTaskDesc().trim() || undefined,
      isCompleted: false,
      dueAt: undefined,
      estimatedPomodoros: this.newTaskEstimatedPomodoros()
        ? Number.parseInt(this.newTaskEstimatedPomodoros(), 10)
        : undefined,
      completedPomodoros: 0,
    };

    this.taskItemService.createTask(taskPayload).subscribe({
      next: (createdTask) => {
        this.tasks.update((currentTasks) => [...currentTasks, createdTask]);
        this.newTaskTitle.set("");
        this.newTaskDesc.set("");
        this.newTaskEstimatedPomodoros.set("");
        this.showAddTaskForm.set(false);
      },
      error: (err) => {
        console.error("HomeComponent: Failed to add task:", err);
        alert("Failed to add task. Please ensure you are logged in.");
      },
    });
  }

  toggleTaskCompletion(id: number): void {
    const taskToUpdate = this.tasks().find((task) => task.id === id);
    if (!taskToUpdate) return;

    if (!this.authService.isAuthenticated()) {
      alert("You must be logged in to update tasks.");
      return;
    }

    const updatedStatus = !taskToUpdate.isCompleted;

    const updatePayload: Omit<TaskItem, "createdAt" | "isExpanded"> = {
      id: taskToUpdate.id,
      title: taskToUpdate.title,
      description: taskToUpdate.description,
      isCompleted: updatedStatus,
      dueAt: taskToUpdate.dueAt,
      estimatedPomodoros: taskToUpdate.estimatedPomodoros,
      completedPomodoros: taskToUpdate.completedPomodoros,
    };

    this.taskItemService.updateTask(id, updatePayload).subscribe({
      next: () => {
        this.tasks.update((currentTasks) =>
          currentTasks.map((task) =>
            task.id === id ? { ...task, isCompleted: updatedStatus } : task,
          ),
        );
      },
      error: (err) => {
        console.error(`Failed to update task ${id}:`, err);
        alert("Failed to update task. Please ensure you are logged in.");
      },
    });
  }

  toggleTaskExpansion(id: number): void {
    this.tasks.update((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, isExpanded: !task.isExpanded } : task,
      ),
    );
  }

  deleteTask(id: number): void {
    if (!this.authService.isAuthenticated()) {
      alert("You must be logged in to delete tasks.");
      return;
    }

    this.taskItemService.deleteTask(id).subscribe({
      next: () => {
        this.tasks.update((currentTasks) =>
          currentTasks.filter((task) => task.id !== id),
        );

        if (this.activeTaskId() === id) {
          this.activeTaskId.set(null);
        }
      },
      error: (err) => {
        console.error(`Failed to delete task ${id}:`, err);
        alert("Failed to delete task. Please ensure you are logged in.");
      },
    });
  }

  trackById(index: number, task: TaskItem): number {
    return task.id;
  }
}
