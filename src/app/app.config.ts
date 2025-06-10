import type { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http"; // Import provideHttpClient

import { routes } from "./app.routes"; // Assuming you have app.routes.ts for routing

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // Provide HttpClient here to make it available for injection
  ],
};
