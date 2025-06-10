import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule, NgIf } from "@angular/common";
import { TaskItem } from "../interfaces/task-item.interface"; // Import the interface

@Component({
  selector: "app-task-item", // Custom HTML tag for this component
  standalone: true, // Marks this as a standalone component, no NgModule needed
  imports: [CommonModule, NgIf], // CommonModule for NgIf, NgFor, etc.
  template: `
    <div
      class="card bg-base-100 shadow-md transition-all duration-300 overflow-hidden"
      [ngClass]="{
        'opacity-70 border-l-8 border-green-500': task.isCompleted,
        'border-l-8 border-primary hover:shadow-lg': !task.isCompleted
      }"
    >
      <div class="card-body p-4 flex-row items-center">
        <!-- Checkbox for task completion -->
        <input
          type="checkbox"
          [checked]="task.isCompleted"
          (change)="toggleCompletion.emit(task.id)"
          class="checkbox checkbox-primary h-6 w-6 flex-shrink-0"
        />

        <!-- Task Title and Pomodoros Info -->
        <div class="flex-grow ml-4">
          <h3
            class="card-title text-xl font-semibold cursor-pointer"
            [ngClass]="{'line-through text-gray-500': task.isCompleted, 'text-gray-400': !task.isCompleted}"
            (click)="toggleExpansion.emit(task.id)"
          >
            {{ task.title }}
          </h3>
          <!-- Display pomodoro progress if available -->
          <p *ngIf="task.estimatedPomodoros != null || (task.completedPomodoros != null && task.completedPomodoros > 0)" class="text-sm text-gray-600 mt-1">
            Pomodoros: {{ task.completedPomodoros || 0 }}
            <span *ngIf="task.estimatedPomodoros != null"> / {{ task.estimatedPomodoros }}</span>
            <span class="ml-2">🍅</span> <!-- Simple pomodoro icon -->
          </p>
        </div>

        <!-- Expand/Collapse Button (only shown if description exists) -->
        <button
          *ngIf="task.description"
          (click)="toggleExpansion.emit(task.id)"
          class="btn btn-ghost btn-circle ml-4 text-gray-600"
          [attr.aria-expanded]="task.isExpanded"
          [attr.aria-label]="task.isExpanded ? 'Collapse description' : 'Expand description'"
        >
          <svg
            class="h-6 w-6 transform transition-transform duration-300"
            [ngClass]="{'rotate-180': task.isExpanded, 'rotate-0': !task.isExpanded}"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        <!-- Delete Button -->
        <button
          (click)="deleteTask.emit(task.id)"
          class="btn btn-error btn-circle btn-sm ml-2"
          [attr.aria-label]="'Delete task ' + task.title"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Task Description (conditionally rendered when expanded) -->
      <div *ngIf="task.isExpanded && task.description" class="p-4 pt-0 text-gray-700 border-t border-gray-200 mt-2">
        <p class="whitespace-pre-wrap">{{ task.description }}</p>
      </div>
    </div>
  `,
  styles: [], // No external CSS file, all styles inline or via Tailwind/DaisyUI classes
})
export class TaskItemComponent {
  // Input property to receive task data from parent component
  @Input() task!: TaskItem;

  // Output events to notify parent about user actions
  @Output() toggleCompletion = new EventEmitter<number>();
  @Output() toggleExpansion = new EventEmitter<number>();
  @Output() deleteTask = new EventEmitter<number>(); // New output for delete
}
