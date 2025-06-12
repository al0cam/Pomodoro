import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, catchError, tap, throwError } from "rxjs";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "../interfaces/auth.interface";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private authApiUrl = "http://localhost:5000";
  isAuthenticated = signal<boolean>(this.hasToken());
  private authTokenSubject = new BehaviorSubject<string | null>(
    localStorage.getItem("jwt_token"),
  );
  authToken$ = this.authTokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.authToken$.subscribe((token) => {
      this.isAuthenticated.set(!!token);
    });
  }

  private hasToken(): boolean {
    return !!localStorage.getItem("jwt_token");
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.authApiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem("jwt_token", response.accessToken);
          this.authTokenSubject.next(response.accessToken);
          this.isAuthenticated.set(true);
        }),
        catchError((error) => {
          console.error("AuthService: Login failed:", error);

          this.isAuthenticated.set(false);
          this.authTokenSubject.next(null);
          const errorMessage =
            error.error?.message || "An unknown error occurred during login.";
          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.authApiUrl}/register`, userData).pipe(
      catchError((error) => {
        console.error("AuthService: Registration failed:", error);
        const errorMessage =
          error.error?.message ||
          "An unknown error occurred during registration.";
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  logout(): void {
    localStorage.removeItem("jwt_token");
    this.authTokenSubject.next(null);
    this.isAuthenticated.set(false);
    this.router.navigate(["/"]);
  }

  getToken(): string | null {
    const token = this.authTokenSubject.getValue();
    return token;
  }
}
