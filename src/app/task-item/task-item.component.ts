import { CommonModule, NgIf } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { TaskItem } from "../interfaces/task-item.interface";

@Component({
  selector: "app-task-item",
  standalone: true,
  imports: [CommonModule, NgIf],
  template: `
    <div
      class="card bg-base-100 shadow-md transition-all duration-300 overflow-hidden border-l-8"
      [ngClass]="{
        'border-accent': isActiveTask,
        'border-green-500 opacity-70': task.isCompleted && !isActiveTask,
        'border-primary hover:shadow-lg': !task.isCompleted && !isActiveTask
      }"
    >
      <div class="card-body p-4 flex-row items-center">
        <!-- Checkbox for task completion -->
        <input
          type="checkbox"
          [checked]="task.isCompleted"
          (change)="toggleCompletion.emit(task.id)"
          class="checkbox checkbox-primary h-6 w-6 flex-shrink-0"
          [disabled]="!allowEditDelete"
        />

        <!-- Task Title and Pomodoros Info -->
        <div class="flex-grow ml-4">
          <h3
            class="card-title text-xl font-semibold cursor-pointer"
            [ngClass]="{'line-through text-gray-400': task.isCompleted, 'text-white': !task.isCompleted}"
            (click)="toggleExpansion.emit(task.id)"
          >
            {{ task.title }}
          </h3>
          <p *ngIf="task.estimatedPomodoros != null || (task.completedPomodoros != null && task.completedPomodoros > 0)" class="text-sm text-gray-300 mt-1">
            Pomodoros: {{ task.completedPomodoros || 0 }}
            <span *ngIf="task.estimatedPomodoros != null"> / {{ task.estimatedPomodoros }}</span>
            <span class="ml-2">🍅</span>
          </p>
        </div>

        <!-- Set Active Button (Conditional based on login and if not already active) -->
        <button
          *ngIf="allowEditDelete && !isActiveTask"
          (click)="setActive.emit(task.id)"
          class="btn btn-sm btn-info ml-2"
          aria-label="Set as active task"
        >
          Set Active
        </button>

        <!-- Clear Active Button (Conditional based on login and if it is active) -->
        <button
          *ngIf="allowEditDelete && isActiveTask"
          (click)="clearActive.emit(task.id)"
          class="btn btn-sm btn-ghost ml-2"
          aria-label="Clear active task"
        >
          Clear Active
        </button>

        <!-- Expand/Collapse Button (only shown if description exists) -->
        <button
          *ngIf="task.description"
          (click)="toggleExpansion.emit(task.id)"
          class="btn btn-ghost btn-circle ml-4 text-gray-300"
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

        <!-- Delete Button (Conditional based on login) -->
        <button
          *ngIf="allowEditDelete"
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
      <div *ngIf="task.isExpanded && task.description" class="p-4 pt-0 text-gray-200 border-t border-gray-700 mt-2">
        <p class="whitespace-pre-wrap">{{ task.description }}</p>
      </div>
    </div>
  `,
  styles: [],
})
export class TaskItemComponent {
  @Input() task!: TaskItem;
  @Input() allowEditDelete = false;
  @Input() isActiveTask = false;
  @Output() toggleCompletion = new EventEmitter<number>();
  @Output() toggleExpansion = new EventEmitter<number>();
  @Output() deleteTask = new EventEmitter<number>();
  @Output() setActive = new EventEmitter<number>();
  @Output() clearActive = new EventEmitter<number>();
}
