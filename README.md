# Pomodoro UI - Task Management & Focus Timer

![image](https://github.com/user-attachments/assets/76ab62e9-d06f-4108-9b2f-eddafdfd47c8)

A modern Pomodoro Timer and Task Management application built with Angular and .NET Core, designed to boost your productivity by combining focused work sessions with efficient task tracking.

## Features

### Customizable Pomodoro Timer
- Adjustable durations for Pomodoro sessions, Short Breaks, and Long Breaks
- Real-time countdown display
- Pause, Start, and Reset functionalities
- Intelligent mode switching (Pomodoro → Short Break → Pomodoro → Long Break, etc.)
- **Persistent Settings**: Timer settings (Pomodoro, Short Break, Long Break durations) persist across sessions using localStorage

### Integrated Task Management
- Create, view, and delete tasks
- Add titles, descriptions, and estimated Pomodoros for each task
- Mark tasks as completed
- **Active Task Highlighting**: Visually highlights the currently active task in the list for better focus
- **Pomodoro Progress Tracking**: Increments the completedPomodoros count for the active task upon a Pomodoro session's completion, with this update persisting to the backend
- **Persistent Active Task**: The selected active task persists across page refreshes, maintaining your focus

### User Authentication
- Secure user registration and login
- Task data is associated with logged-in users, ensuring personalized task lists and persistence via a backend API

### Responsive Design
Optimized for a seamless experience across various devices (mobile, tablet, desktop) using Tailwind CSS and DaisyUI.

## Technologies Used

### Frontend
- **Angular**: A powerful framework for building dynamic single-page applications, leveraging its modern features
  - **Angular Signals**: For reactive state management, providing highly performant and explicit change detection
  - **Standalone Components**: For a streamlined, module-less architecture, enhancing development efficiency
- **TypeScript**: A superset of JavaScript that adds static types, improving code quality and maintainability
- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs directly in your HTML
- **DaisyUI**: A component library that functions as a Tailwind CSS plugin, providing pre-built, styled UI components
- **RxJS**: For reactive programming and handling asynchronous operations, especially with HTTP requests
- **localStorage**: For client-side persistence of user settings and the active task ID

### Backend (Implicit from API calls)
- **.NET Core**: A cross-platform, open-source framework used for building robust and scalable backend APIs (inferred from the API endpoints used for data persistence and authentication)

## Project Structure

The frontend application (`src/app`) is organized as follows:

```
src/
├── app/
│   ├── auth/                     # Authentication related components (login, register)
│   │   ├── login/                # Login component
│   │   └── register/             # Register component
│   ├── home/                     # Main application component (timer, task list)
│   ├── interfaces/               # TypeScript interfaces for data models (e.g., TaskItem, Auth)
│   ├── interceptors/             # HTTP interceptors (e.g., AuthInterceptor for JWT handling)
│   ├── services/                 # Angular services for data fetching and state management
│   │   ├── auth.service.ts       # Handles user authentication (login, register, logout, token management)
│   │   ├── task-item.service.ts  # Interacts with the backend API for CRUD operations on tasks
│   │   └── settings.service.ts   # Manages and persists timer duration settings locally
│   ├── settings/                 # Component for configuring timer durations
│   ├── task-item/                # Reusable component for displaying individual tasks
│   ├── app.component.ts          # Root component, handles global layout and high-level routing
│   ├── app.config.ts             # Application's main configuration file (HTTP interceptors, providers, routing)
│   └── app.routes.ts             # Defines the application's top-level routes
└── main.ts                       # Entry point for bootstrapping the Angular application
```

## Setup and Installation

### Prerequisites
- **Node.js** (LTS version recommended) & **npm** (Node Package Manager)
- **Angular CLI**: Install globally via `npm install -g @angular/cli`
- A running **.NET Core backend API** (listening on `http://localhost:5000/`) that provides authentication and task management endpoints

### Frontend Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/al0cam/Pomodoro.git
   cd Pomodoro
   ```

   > **Note**: This README assumes your Angular project resides in the root of the repository. If it's in a subdirectory (e.g., `frontend/`), navigate into that directory first: `cd frontend`.

2. **Install npm dependencies:**
   ```bash
   npm install
   ```

   This command will install all required Angular, Tailwind CSS, and DaisyUI packages.

3. **Start the Angular development server:**
   ```bash
   ng serve
   ```

   The Angular application will typically be available at `http://localhost:4200/`. Your browser should automatically open it.

### Backend Setup (Brief)

Ensure your .NET Core backend is running and configured to serve the API endpoints on `http://localhost:5000`. The frontend expects the following endpoints:

- `http://localhost:5000/login`
- `http://localhost:5000/register`
- `http://localhost:5000/api/TaskItem` (for GET all, POST create, PUT update, DELETE)

## Usage

### Login/Register
Navigate to `/login` or `/register` to create an account or sign in. This is required to create and manage personalized tasks that persist.

### Pomodoro Timer
- Use the "Pomodoro", "Short Break", "Long Break" buttons to switch between different timer modes
- Click "Start" to begin the countdown for the current mode
- Click "Pause" to temporarily stop the timer
- Click "Reset" to return the current mode's timer to its initial duration and clear any active task selection

### Task Management
- **Add New Tasks**: Logged-in users can click the "Add New Task" button to reveal a form. Enter a title, optional description, and estimated Pomodoros, then click "Add Task"
- **Mark as Completed**: Click the checkbox next to a task to toggle its completion status. Completed tasks will appear slightly faded and crossed out
- **Expand/Collapse Details**: Click a task title to expand or collapse its description and view additional details like Pomodoro progress
- **Set Active Task**: Click the "Set Active" button next to a task to designate it as your current focus. This task will be visually highlighted with an accent border and its completedPomodoros count will automatically increment after each completed Pomodoro session
- **Clear Active Task**: If a task is active, an "Clear Active" button will appear. Click it to remove the active status
- **Delete Tasks**: Use the trash can icon button to permanently remove a task

### Settings
- Click the gear icon (settings button) in the top-left corner of the main page to navigate to the settings
- Adjust the durations (in minutes) for Pomodoro sessions, Short Breaks, and Long Breaks. Changes are automatically saved

## Contributing

Contributions are welcome! If you have suggestions for new features, improvements, or bug fixes, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

