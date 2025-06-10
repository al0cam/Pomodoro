import {
  Component,
  signal,
  computed,
  effect,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { CommonModule, NgIf, NgFor } from "@angular/common"; // NgIf and NgFor for structural directives
import { FormsModule } from "@angular/forms"; // FormsModule for ngModel two-way binding
import { TaskItemComponent } from "./task-item/task-item.component"; // Import the TaskItemComponent
import { TaskItem } from "./interfaces/task-item.interface"; // Import the TaskItem interface
import { TaskItemService } from "./services/task-item.service"; // Import the new TaskItemService

@Component({
  selector: "app-root", // The root component of the application
  standalone: true, // Declares this component as standalone
  imports: [CommonModule, FormsModule, NgIf, NgFor, TaskItemComponent], // Import necessary modules and components
  templateUrl: "./app.component.html", // Point to the external HTML file
  styles: [], // No external CSS file, all styles inline or via Tailwind/DaisyUI classes
})
export class AppComponent implements OnInit, OnDestroy {
  // Define Pomodoro timer settings as readonly constants
  readonly POMODORO_SETTINGS = {
    pomodoro: 25 * 60, // 25 minutes in seconds
    shortBreak: 5 * 60, // 5 minutes in seconds
    longBreak: 15 * 60, // 15 minutes in seconds
  };

  // Angular Signals for reactive timer state
  timerMode = signal<"pomodoro" | "shortBreak" | "longBreak">("pomodoro");
  timeLeft = signal<number>(this.POMODORO_SETTINGS.pomodoro);
  isActive = signal<boolean>(false);
  pomodoroCount = signal<number>(0); // Tracks completed pomodoro sessions

  // Private variable to hold the interval ID for timer cleanup
  private timerInterval: any;

  // Computed signal for formatted time display (MM:SS)
  // This updates automatically whenever timeLeft() changes
  formattedTime = computed(() => {
    const minutes = Math.floor(this.timeLeft() / 60);
    const remainingSeconds = this.timeLeft() % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  });

  // Constructor with an effect to manage the timer interval.
  // Effects run when their dependencies (signals) change.
  constructor(private taskItemService: TaskItemService) {
    // Inject the TaskItemService
    effect(() => {
      // Logic to start the timer interval
      if (this.isActive() && this.timeLeft() > 0) {
        // Clear any existing interval to prevent multiple timers running
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }
        this.timerInterval = setInterval(() => {
          this.timeLeft.update((prevTime) => prevTime - 1); // Decrement timeLeft signal
        }, 1000); // Update every second
      } else if (this.timeLeft() === 0) {
        // Logic when timer reaches zero
        clearInterval(this.timerInterval); // Stop the timer
        alert(`${this.timerMode()} finished!`); // Using alert as per previous instruction to display completion message

        // Handle mode switching after a session ends
        if (this.timerMode() === "pomodoro") {
          this.pomodoroCount.update((prevCount) => prevCount + 1); // Increment pomodoro count
          if (this.pomodoroCount() % 4 === 0) {
            // After 4 pomodoros, go to long break
            this.switchMode("longBreak");
          } else {
            // Otherwise, go to short break
            this.switchMode("shortBreak");
          }
        } else {
          // After a break, go back to pomodoro mode
          this.switchMode("pomodoro");
        }
        this.isActive.set(false); // Pause the timer after completion
      }
    });
  }

  // Lifecycle hook: Called once after the component is initialized.
  // This is where we fetch initial tasks from the backend.
  ngOnInit(): void {
    this.fetchTasks(); // Fetch tasks when the component initializes
  }

  // Lifecycle hook: Called once before the component is destroyed.
  // Essential for clearing intervals to prevent memory leaks.
  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }

  // --- Timer Control Methods ---
  toggleTimer(): void {
    this.isActive.update((current) => !current); // Toggles isActive signal
  }

  resetTimer(): void {
    clearInterval(this.timerInterval); // Clear the running interval
    this.isActive.set(false); // Stop the timer
    this.timerMode.set("pomodoro"); // Reset mode to default
    this.timeLeft.set(this.POMODORO_SETTINGS.pomodoro); // Reset time to default pomodoro duration
    this.pomodoroCount.set(0); // Reset pomodoro count
  }

  switchMode(mode: "pomodoro" | "shortBreak" | "longBreak"): void {
    clearInterval(this.timerInterval); // Clear current interval
    this.isActive.set(false); // Stop the timer
    this.timerMode.set(mode); // Set the new timer mode
    this.timeLeft.set(this.POMODORO_SETTINGS[mode]); // Set time according to the new mode
  }

  // --- Task Management Methods and States ---
  tasks = signal<TaskItem[]>([]); // Angular Signal to hold the list of tasks

  // Signals for new task input form
  newTaskTitle = signal<string>("");
  newTaskDesc = signal<string>("");
  newTaskEstimatedPomodoros = signal<string>("");

  // Computed signal to sort tasks for display: uncompleted first, then by creation date
  sortedTasks = computed(() => {
    const currentTasks = [...this.tasks()]; // Get current tasks from signal
    return currentTasks.sort((a, b) => {
      // Sort: Uncompleted tasks appear before completed ones
      if (a.isCompleted && !b.isCompleted) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;
      // Secondary sort: Newest tasks first (descending by createdAt)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  });

  /**
   * Fetches all tasks from the backend and updates the local tasks signal.
   */
  fetchTasks(): void {
    this.taskItemService.getAllTasks().subscribe({
      next: (data) => {
        // Map backend Date strings to actual Date objects and add UI state
        const fetchedTasks = data.map((task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueAt: task.dueAt ? new Date(task.dueAt) : undefined,
          isExpanded: false, // Ensure UI state is initialized
        }));
        this.tasks.set(fetchedTasks);
      },
      error: (err) => {
        console.error("Failed to fetch tasks:", err);
        // Optionally, show an error message to the user
      },
    });
  }

  // Method to handle adding a new task from the form
  handleAddTask(): void {
    const title = this.newTaskTitle().trim();
    if (!title) return; // Prevent adding empty tasks

    // Prepare task data for backend (omitting id, createdAt, isExpanded)
    const taskPayload = {
      title: title,
      description: this.newTaskDesc().trim() || undefined,
      isCompleted: false, // Default to false for new tasks
      dueAt: undefined, // Currently not supported by UI form
      estimatedPomodoros: this.newTaskEstimatedPomodoros()
        ? parseInt(this.newTaskEstimatedPomodoros(), 10)
        : undefined,
      completedPomodoros: 0, // Default to 0 for new tasks
    };

    this.taskItemService.createTask(taskPayload).subscribe({
      next: (createdTask) => {
        // Add the newly created task (with ID from backend) to the local tasks signal
        this.tasks.update((currentTasks) => [...currentTasks, createdTask]);
        // Reset form fields
        this.newTaskTitle.set("");
        this.newTaskDesc.set("");
        this.newTaskEstimatedPomodoros.set("");
      },
      error: (err) => {
        console.error("Failed to add task:", err);
        alert("Failed to add task. Please try again."); // User-friendly error
      },
    });
  }

  // Method to toggle the completion status of a task
  toggleTaskCompletion(id: number): void {
    const taskToUpdate = this.tasks().find((task) => task.id === id);
    if (!taskToUpdate) return;

    const updatedStatus = !taskToUpdate.isCompleted;

    // Create payload for backend update (omit createdAt and isExpanded)
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
        // If successful, update the local tasks signal
        this.tasks.update((currentTasks) =>
          currentTasks.map((task) =>
            task.id === id ? { ...task, isCompleted: updatedStatus } : task,
          ),
        );
      },
      error: (err) => {
        console.error(`Failed to update task ${id}:`, err);
        alert("Failed to update task. Please try again.");
      },
    });
  }

  // Method to toggle the expansion status of a task (show/hide description)
  toggleTaskExpansion(id: number): void {
    this.tasks.update((currentTasks) =>
      currentTasks.map(
        (task) =>
          task.id === id ? { ...task, isExpanded: !task.isExpanded } : task, // Toggle isExpanded
      ),
    );
  }

  /**
   * Deletes a task from the backend and updates the local tasks signal.
   * @param id The ID of the task to delete.
   */
  deleteTask(id: number): void {
    this.taskItemService.deleteTask(id).subscribe({
      next: () => {
        // If deletion is successful, filter the task out of the local signal
        this.tasks.update((currentTasks) =>
          currentTasks.filter((task) => task.id !== id),
        );
      },
      error: (err) => {
        console.error(`Failed to delete task ${id}:`, err);
        alert("Failed to delete task. Please try again.");
      },
    });
  }

  // trackBy function for *ngFor to improve list rendering performance
  trackById(index: number, task: TaskItem): number {
    return task.id;
  }
}
