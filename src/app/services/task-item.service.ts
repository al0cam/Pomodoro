import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, map, of, throwError } from "rxjs";
import { TaskItem } from "../interfaces/task-item.interface";

@Injectable({
  providedIn: "root",
})
export class TaskItemService {
  private apiUrl = "http://localhost:5000/api/TaskItem";

  constructor(private http: HttpClient) {}

  getAllTasks(): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>(this.apiUrl).pipe(
      map((tasks) =>
        tasks.map((task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueAt: task.dueAt ? new Date(task.dueAt) : undefined,
        })),
      ),
      catchError((error) => {
        if (error.status === 404) {
          console.log("TaskItemService: No tasks found on the backend.");
          return of([]);
        }
        console.error("TaskItemService: Error fetching tasks:", error);
        return throwError(() => new Error("Failed to fetch tasks."));
      }),
    );
  }

  getTaskById(id: number): Observable<TaskItem> {
    return this.http.get<TaskItem>(`${this.apiUrl}/${id}`).pipe(
      map((task) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueAt: task.dueAt ? new Date(task.dueAt) : undefined,
      })),
      catchError((error) => {
        console.error(
          `TaskItemService: Error fetching task with ID ${id}:`,
          error,
        );
        return throwError(
          () => new Error(`Failed to fetch task with ID ${id}`),
        );
      }),
    );
  }

  createTask(
    task: Omit<TaskItem, "id" | "createdAt" | "isExpanded" | "userId">,
  ): Observable<TaskItem> {
    const payload = { ...task, isCompleted: task.isCompleted ?? false };
    return this.http.post<TaskItem>(this.apiUrl, payload).pipe(
      map((createdTask) => ({
        ...createdTask,
        createdAt: new Date(createdTask.createdAt),
        dueAt: createdTask.dueAt ? new Date(createdTask.dueAt) : undefined,
        isExpanded: false,
      })),
      catchError((error) => {
        console.error("TaskItemService: Error creating task:", error);
        return throwError(() => new Error("Failed to create task."));
      }),
    );
  }

  updateTask(
    id: number,
    task: Omit<TaskItem, "createdAt" | "isExpanded" | "userId">,
  ): Observable<void> {
    const payload = { ...task, isCompleted: task.isCompleted ?? false };
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload).pipe(
      catchError((error) => {
        console.error(
          `TaskItemService: Error updating task with ID ${id}:`,
          error,
        );
        return throwError(
          () => new Error(`Failed to update task with ID ${id}.`),
        );
      }),
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(
          `TaskItemService: Error deleting task with ID ${id}:`,
          error,
        );
        return throwError(
          () => new Error(`Failed to delete task with ID ${id}.`),
        );
      }),
    );
  }
}
