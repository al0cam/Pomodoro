import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { type Observable, catchError, map, of } from "rxjs";
import type { TaskItem } from "../interfaces/task-item.interface";

@Injectable({
  providedIn: "root",
})
export class TaskItemService {
  private apiUrl = "http://localhost:5000/api/TaskItem";

  constructor(private http: HttpClient) {}

  /**
   * Fetches all task items from the backend.
   * @returns An Observable array of TaskItem.
   */
  getAllTasks(): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>(this.apiUrl).pipe(
      // Map Date strings from backend to actual Date objects for consistency
      map((tasks) =>
        tasks.map((task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueAt: task.dueAt ? new Date(task.dueAt) : undefined, // Convert if exists
        })),
      ),
      // Handle 404 specifically for empty results, returning empty array
      catchError((error) => {
        if (error.status === 404) {
          console.log("No tasks found on the backend.");
          return of([]); // Return an empty array if 404 (no tasks)
        }
        console.error("Error fetching tasks:", error);
        return of([]); // Return empty array on other errors too
      }),
    );
  }

  /**
   * Fetches a single task item by its ID.
   * @param id The ID of the task item to fetch.
   * @returns An Observable of TaskItem.
   */
  getTaskById(id: number): Observable<TaskItem> {
    return this.http.get<TaskItem>(`${this.apiUrl}/${id}`).pipe(
      map((task) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueAt: task.dueAt ? new Date(task.dueAt) : undefined,
      })),
      catchError((error) => {
        console.error(`Error fetching task with ID ${id}:`, error);
        throw error; // Re-throw to propagate error to component
      }),
    );
  }

  /**
   * Creates a new task item on the backend.
   * Note: We omit 'id', 'createdAt', 'isExpanded' as they are backend-generated or UI-only.
   * @param task The task data to create (without ID, createdAt, isExpanded).
   * @returns An Observable of the created TaskItem.
   */
  createTask(
    task: Omit<TaskItem, "id" | "createdAt" | "isExpanded">,
  ): Observable<TaskItem> {
    // Ensure `isCompleted` is sent as false if not explicitly set
    const payload = { ...task, isCompleted: task.isCompleted ?? false };
    return this.http.post<TaskItem>(this.apiUrl, payload).pipe(
      map((createdTask) => ({
        ...createdTask,
        createdAt: new Date(createdTask.createdAt),
        dueAt: createdTask.dueAt ? new Date(createdTask.dueAt) : undefined,
        isExpanded: false, // Ensure UI state is added after creation
      })),
      catchError((error) => {
        console.error("Error creating task:", error);
        throw error;
      }),
    );
  }

  /**
   * Updates an existing task item on the backend.
   * Note: We omit 'createdAt' and 'isExpanded' as they are backend-maintained or UI-only.
   * @param id The ID of the task to update.
   * @param task The updated task data (without createdAt, isExpanded).
   * @returns An Observable indicating completion of the update.
   */
  updateTask(
    id: number,
    task: Omit<TaskItem, "createdAt" | "isExpanded">,
  ): Observable<void> {
    // Ensure `isCompleted` is explicitly sent for updates
    const payload = { ...task, isCompleted: task.isCompleted ?? false };
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload).pipe(
      catchError((error) => {
        console.error(`Error updating task with ID ${id}:`, error);
        throw error;
      }),
    );
  }

  /**
   * Deletes a task item from the backend.
   * @param id The ID of the task to delete.
   * @returns An Observable indicating completion of the deletion.
   */
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error deleting task with ID ${id}:`, error);
        throw error;
      }),
    );
  }
}
