# Task Manager Data Synchronization - Azure Functions Technical Specification

## 1. Introduction

This document outlines the technical specifications for synchronizing Task Manager data between the AppZ client application and Azure Functions. The primary goal is to enable seamless, real-time, and offline-capable data synchronization for tasks, supporting CRUD operations and recurrence patterns.

## 2. Current Data Model

The core data entities for the Task Manager are `Task` and `RecurrencePattern`. These models will be implemented as C# classes, adhering to EF Core conventions for mapping to a Supabase (PostgreSQL) database.

### 2.1. Base Entity

To promote consistency and reusability, a `BaseEntity` class will be introduced for common properties like `Id`, `CreatedAt`, and `UpdatedAt`.

```csharp
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace TaskManager.Domain.Entities
{
    public abstract class BaseEntity
    {
        [Key]
        [Column("id")]
        [JsonPropertyName("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Column("created_at")]
        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        [JsonPropertyName("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
```

### 2.2. Task Class

The `Task` class represents a single task item, including its properties and relationships.

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using TaskManager.Domain.Enums; // Assuming enums are in this namespace

namespace TaskManager.Domain.Entities
{
    [Table("tasks")]
    public class Task : BaseEntity
    {
        [Column("parent_task_id")]
        [JsonPropertyName("parentTaskId")]
        public string? ParentTaskId { get; set; }

        [Column("task_level")]
        [JsonPropertyName("taskLevel")]
        public int TaskLevel { get; set; } // 1, 2, 3 (max)

        [Required]
        [Column("title")]
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [Column("status")]
        [JsonPropertyName("status")]
        public TaskStatus Status { get; set; } = TaskStatus.Pending;

        [Column("priority")]
        [JsonPropertyName("priority")]
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;

        [Column("due_date")]
        [JsonPropertyName("dueDate")]
        public DateTime? DueDate { get; set; } // Stored as UTC in DB

        [Column("is_deleted")]
        [JsonPropertyName("isDeleted")]
        public bool IsDeleted { get; set; }

        [Column("is_archived")]
        [JsonPropertyName("isArchived")]
        public bool IsArchived { get; set; }

        [Column("archived_at")]
        [JsonPropertyName("archivedAt")]
        public DateTime? ArchivedAt { get; set; }

        [Column("completed_at")]
        [JsonPropertyName("completedAt")]
        public DateTime? CompletedAt { get; set; }

        [Column("is_recurring")]
        [JsonPropertyName("isRecurring")]
        public bool IsRecurring { get; set; }

        [Column("recurrence_pattern")]
        [JsonPropertyName("recurrencePattern")]
        [JsonIgnore] // RecurrencePattern will be stored as JSONB in Supabase, handled by EF Core JSON support
        public RecurrencePattern? RecurrencePattern { get; set; }

        [Column("recurrence_end_date")]
        [JsonPropertyName("recurrenceEndDate")]
        public DateTime? RecurrenceEndDate { get; set; }

        [Column("parent_recurrence_id")]
        [JsonPropertyName("parentRecurrenceId")]
        public string? ParentRecurrenceId { get; set; }

        [Column("recurrence_instance_id")]
        [JsonPropertyName("recurrenceInstanceId")]
        public string? RecurrenceInstanceId { get; set; }

        // Navigation property for subtasks
        [InverseProperty("ParentTask")]
        public ICollection<Task> Subtasks { get; set; } = new List<Task>();

        // Navigation property for parent task
        [ForeignKey("ParentTaskId")]
        public Task? ParentTask { get; set; }
    }
}
```

### 2.3. RecurrencePattern Class

The `RecurrencePattern` class defines how a task recurs. This will be stored as a JSONB column in Supabase using EF Core's JSON support.

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using TaskManager.Domain.Enums; // Assuming enums are in this namespace

namespace TaskManager.Domain.Entities
{
    // This class is not a separate table but part of the Task entity,
    // stored as JSONB in the 'recurrence_pattern' column.
    public class RecurrencePattern
    {
        [JsonPropertyName("frequency")]
        public RecurrenceFrequency Frequency { get; set; }

        [JsonPropertyName("interval")]
        public int Interval { get; set; } // e.g., every 2 weeks, every 3 months

        [JsonPropertyName("weeklyDays")]
        public List<RecurrenceWeeklyDay>? WeeklyDays { get; set; } // For weekly recurrence, which days

        [JsonPropertyName("monthlyDay")]
        public int? MonthlyDay { get; set; } // For monthly recurrence, which day of month (1-31)

        [JsonPropertyName("count")]
        public int? Count { get; set; } // Number of occurrences (optional, if not set, recurs until end date)
    }
}
```

### 2.4. Enums

Enums for `TaskStatus`, `TaskPriority`, `RecurrenceFrequency`, and `RecurrenceWeeklyDay`.

```csharp
namespace TaskManager.Domain.Enums
{
    public enum TaskStatus
    {
        Pending,
        InProgress,
        Completed,
        Cancelled
    }

    public enum TaskPriority
    {
        Low,
        Medium,
        High,
        Critical
    }

    public enum RecurrenceFrequency
    {
        Daily,
        Weekly,
        Monthly,
        Yearly
    }

    public enum RecurrenceWeeklyDay
    {
        Sun,
        Mon,
        Tue,
        Wed,
        Thu,
        Fri,
        Sat
    }
}
```

## 3. Synchronization Strategy

### 3.1. Direction

Bi-directional synchronization between the AppZ client (local IndexedDB) and Azure Functions (backend database: Supabase PostgreSQL).

### 3.2. Triggers

*   **Client-side (IndexedDB-first):**
    *   All data modifications (create, update, delete, archive, unarchive, complete, recurrence changes) are first applied to the client's local IndexedDB.
    *   Synchronization with the Azure Functions backend will occur either:
        *   **On-demand:** Triggered explicitly by user action (e.g., a "Sync Now" button).
        *   **Periodically:** Automated background sync for pending changes when online (e.g., every X minutes, or when the app comes to foreground).
        *   **Event-driven:** Potentially triggered by specific client-side events after local persistence.
*   **Server-side:**
    *   **Supabase Realtime (Postgres Change Data Capture):** Leverage Supabase's real-time capabilities to listen for changes in the PostgreSQL database. This can trigger Azure Functions (e.g., via a Supabase Webhook or a custom listener) to push updates to connected clients (e.g., via Azure SignalR Service) or process changes for other integrations.
    *   **Scheduled Jobs (Timer-triggered Azure Functions):** For less critical or bulk operations (e.g., archiving expired tasks, cleaning up deleted tasks, generating recurrence instances).

### 3.3. Conflict Resolution

*   **Last-Write Wins:** For concurrent updates to the same task, the most recent update (based on `UpdatedAt` timestamp) will prevail.
*   **Optimistic Concurrency (EF Core):** Implement optimistic concurrency using EF Core's built-in mechanisms (e.g., a `RowVersion` property or checking `UpdatedAt` timestamp). If a conflict is detected, the client will be notified to re-fetch the latest version and re-apply changes.

### 3.4. Delta Sync

Only send changed fields or new/deleted entities to minimize network traffic and improve performance. EF Core's change tracking capabilities will be utilized to efficiently identify and persist only modified data. The `UpdatedAt` field will be crucial for tracking changes.

## 4. Azure Function Endpoints

To simplify deployment and management, all Task Manager API operations will be exposed through a single HTTP-triggered Azure Function, `TaskManagerApi`. This function will act as a dispatcher, routing requests to appropriate internal handlers based on the HTTP method and URL path.

**Base URL:** `https://<your-function-app-name>.azurewebsites.net/api/TaskManagerApi`

### 4.1. Request Routing Logic

The `TaskManagerApi` function will analyze the incoming HTTP request to determine the intended operation:

*   **HTTP Method:** GET, POST, PUT, DELETE
*   **URL Path:** `/tasks`, `/tasks/{id}`, `/tasks/{id}/archive`, `/tasks/{id}/unarchive`, `/tasks/{id}/complete`, `/tasks/sync`

### 4.2. Operations Handled by `TaskManagerApi`

#### 4.2.1. Create Task

*   **Method:** `POST`
*   **Path:** `/tasks`
*   **Description:** Creates a new task.
*   **Request Body:** `Task` object (excluding `id`, `createdAt`, `updatedAt`, `isDeleted`, `isArchived`, `archivedAt`, `completedAt`).
*   **Response:** `201 Created` with the full `Task` object, including generated `id` and timestamps.
*   **Error Codes:** `400 Bad Request` (validation errors), `500 Internal Server Error`.

#### 4.2.2. Update Task

*   **Method:** `PUT`
*   **Path:** `/tasks/{id}`
*   **Description:** Updates an existing task.
*   **Request Path Parameter:** `id` of the task to update.
*   **Request Body:** Partial `Task` object with fields to update. `updatedAt` will be set by the server.
*   **Response:** `200 OK` with the updated `Task` object.
*   **Error Codes:** `400 Bad Request`, `404 Not Found`, `409 Conflict` (if optimistic concurrency fails), `500 Internal Server Error`.

#### 4.2.3. Soft Delete Task

*   **Method:** `DELETE`
*   **Path:** `/tasks/{id}`
*   **Description:** Marks a task as deleted (`isDeleted = true`).
*   **Request Path Parameter:** `id` of the task to soft delete.
*   **Response:** `204 No Content`.
*   **Error Codes:** `404 Not Found`, `500 Internal Server Error`.

#### 4.2.4. Archive Task

*   **Method:** `POST`
*   **Path:** `/tasks/{id}/archive`
*   **Description:** Archives a task (`isArchived = true`).
*   **Request Path Parameter:** `id` of the task to archive.
*   **Response:** `204 No Content`.
*   **Error Codes:** `404 Not Found`, `500 Internal Server Error`.

#### 4.2.5. Unarchive Task

*   **Method:** `POST`
*   **Path:** `/tasks/{id}/unarchive`
*   **Description:** Unarchives a task (`isArchived = false`).
*   **Request Path Parameter:** `id` of the task to unarchive.
*   **Response:** `204 No Content`.
*   **Error Codes:** `404 Not Found`, `500 Internal Server Error`.

#### 4.2.6. Complete Task

*   **Method:** `POST`
*   **Path:** `/tasks/{id}/complete`
*   **Description:** Marks a task as completed (`status = 'Completed'`).
*   **Request Path Parameter:** `id` of the task to complete.
*   **Response:** `204 No Content`.
*   **Error Codes:** `404 Not Found`, `500 Internal Server Error`.

#### 4.2.7. Get Tasks (All, Filtered, Paginated)

*   **Method:** `GET`
*   **Path:** `/tasks`
*   **Description:** Retrieves a list of tasks. Supports filtering by status, priority, parent, and pagination.
*   **Request Query Parameters:**
    *   `status`: Filter by `TaskStatus`.
    *   `priority`: Filter by `TaskPriority`.
    *   `parentTaskId`: Filter by parent task.
    *   `isArchived`: Boolean to include/exclude archived tasks.
    *   `isDeleted`: Boolean to include/exclude deleted tasks.
    *   `page`: Page number (for pagination).
    *   `pageSize`: Number of items per page.
    *   `searchTerm`: Search by title or description.
*   **Response:** `200 OK` with an array of `Task` objects or a paginated result object `{ items: Task[], total: number }`.
*   **Error Codes:** `400 Bad Request`, `500 Internal Server Error`.

#### 4.2.8. Get Task by ID

*   **Method:** `GET`
*   **Path:** `/tasks/{id}`
*   **Description:** Retrieves a single task by its ID.
*   **Request Path Parameter:** `id` of the task.
*   **Response:** `200 OK` with the `Task` object.
*   **Error Codes:** `404 Not Found`, `500 Internal Server Error`.

#### 4.2.9. Bulk/Delta Synchronization

*   **Method:** `POST`
*   **Path:** `/tasks/sync`
*   **Description:** A dedicated endpoint for efficient bulk synchronization of changes.
*   **Request Body:** An object containing arrays of `createdTasks`, `updatedTasks`, `deletedTaskIds`.
    ```json
    {
      "createdTasks": [ { /* Task object */ } ],
      "updatedTasks": [ { /* Task object */ } ],
      "deletedTaskIds": [ "id1", "id2" ]
    }
    ```
*   **Response:** `200 OK` with a summary of applied changes and any conflicts.
*   **Error Codes:** `400 Bad Request`, `500 Internal Server Error`.

## 5. Authentication & Authorization

*   **Authentication:**
    *   **API Key:** A simple approach for internal/trusted clients. The API key would be passed in the `X-API-Key` header.
    *   **OAuth 2.0 / OpenID Connect:** For more robust security, integrate with Azure Active Directory (AAD) or another identity provider. Access tokens would be passed in the `Authorization: Bearer <token>` header.
*   **Authorization:**
    *   **Role-Based Access Control (RBAC):** Define roles (e.g., `User`, `Admin`) and assign permissions to perform specific actions on tasks. This would be enforced within the Azure Functions.

## 6. Error Handling

*   **Standard HTTP Status Codes:** Use appropriate HTTP status codes (e.g., 200, 201, 204, 400, 401, 403, 404, 409, 500).
*   **Consistent Error Response Format:** Return a JSON object for errors, including a `code`, `message`, and optionally `details` (e.g., validation errors).
    ```json
    {
      "code": "ValidationError",
      "message": "Invalid input for task creation.",
      "details": [
        { "field": "title", "error": "Title is required." }
      ]
    }
    ```
*   **Retry Mechanisms:** Clients should implement exponential backoff and retry logic for transient errors (e.g., 500, 503).

## 7. Considerations

*   **Offline Support:** The client application must be designed to queue changes while offline and synchronize them once connectivity is restored. The `updatedAt` timestamp is critical for this.
*   **Performance:** Optimize database queries and function execution for large datasets. Consider indexing relevant fields in the backend database.
*   **Security:**
    *   Always use HTTPS.
    *   Sanitize and validate all input to prevent injection attacks.
    *   Implement least privilege for database access.
    *   Secure API keys/tokens.
*   **Scalability:** Azure Functions are inherently scalable, but database design and query optimization are crucial for maintaining performance under heavy load.
*   **Recurrence Logic:** The Azure Functions should be capable of generating future recurrence instances based on the `RecurrencePattern` and `recurrenceEndDate`. This might involve a separate scheduled function.
*   **Archiving and Deletion:** Implement a background process (e.g., a Durable Function or a scheduled timer trigger) to permanently delete tasks marked `isDeleted` after a retention period, and to archive completed tasks after a certain duration.

## 8. Azure Functions Project Structure (Enterprise-Grade, SOLID Principles)

To adhere to SOLID principles and establish an enterprise-grade architecture, the Azure Functions solution will be structured into multiple projects, each with a distinct responsibility. This promotes separation of concerns, maintainability, testability, and scalability.

```
.
├── TaskManager.sln                 # Solution file
├── TaskManager.Api/                # Azure Functions Host Project
│   ├── TaskManager.Api.csproj
│   ├── Program.cs                  # Entry point for .NET Isolated Worker
│   ├── TaskManagerApi.cs           # Main HTTP-triggered function (dispatcher)
│   ├── host.json
│   ├── local.settings.json
│   └── appsettings.json
├── TaskManager.Application/        # Application Layer Project
│   ├── TaskManager.Application.csproj
│   ├── Features/                   # Use Cases / Command & Query Handlers
│   │   ├── Tasks/
│   │   │   ├── Commands/
│   │   │   │   ├── CreateTask.cs
│   │   │   │   ├── UpdateTask.cs
│   │   │   │   └── DeleteTask.cs
│   │   │   └── Queries/
│   │   │       ├── GetTaskById.cs
│   │   │       └── GetTasksList.cs
│   ├── Interfaces/                 # Application-specific interfaces (e.g., ITaskService)
│   │   └── ITaskService.cs
│   ├── Mappings/                   # AutoMapper profiles (e.g., DTO to Entity)
│   │   └── TaskProfile.cs
│   └── DTOs/                       # Data Transfer Objects
│       ├── TaskDto.cs
│       └── RecurrenceDto.cs
├── TaskManager.Domain/             # Domain Layer Project
│   ├── TaskManager.Domain.csproj
│   ├── Entities/                   # Core business entities
│   │   ├── BaseEntity.cs
│   │   ├── Task.cs
│   │   └── RecurrencePattern.cs
│   ├── Enums/                      # Domain-specific enums
│   │   ├── TaskStatus.cs
│   │   ├── TaskPriority.cs
│   │   ├── RecurrenceFrequency.cs
│   │   └── RecurrenceWeeklyDay.cs
│   └── Interfaces/                 # Domain interfaces (e.g., ITaskRepository)
│       └── ITaskRepository.cs
├── TaskManager.Infrastructure/     # Infrastructure Layer Project
│   ├── TaskManager.Infrastructure.csproj
│   ├── Data/
│   │   ├── AppDbContext.cs         # EF Core DbContext
│   │   └── Migrations/             # EF Core Migrations
│   ├── Repositories/               # Concrete implementations of domain repositories
│   │   └── TaskRepository.cs
│   ├── Services/                   # External service integrations (e.g., Supabase client)
│   │   └── SupabaseClientService.cs
│   └── Timers/                     # Timer-triggered function implementations
│       ├── ArchiveCleanupTimer.cs
│       └── RecurrenceGeneratorTimer.cs
├── TaskManager.Shared/             # Shared Utilities/Constants Project
│   ├── TaskManager.Shared.csproj
│   └── Constants/
│       └── AppConstants.cs
└── tests/                          # Unit/Integration Tests
    ├── TaskManager.Api.Tests/
    ├── TaskManager.Application.Tests/
    ├── TaskManager.Domain.Tests/
    └── TaskManager.Infrastructure.Tests/
```

**Explanation of Layers and Projects:**

*   **`TaskManager.sln`**: The Visual Studio solution file that organizes all projects.
*   **`TaskManager.Api` (Azure Functions Host Project)**:
    *   **Responsibility**: The entry point for the Azure Functions application. It hosts the HTTP-triggered function (`TaskManagerApi.cs`) which acts as a thin controller, dispatching requests to the Application layer.
    *   **Dependencies**: `TaskManager.Application`, `TaskManager.Shared`.
    *   **SOLID Principles**: Adheres to the Single Responsibility Principle (SRP) by focusing solely on hosting and routing.
*   **`TaskManager.Application` (Application Layer Project)**:
    *   **Responsibility**: Orchestrates business logic, defines use cases (commands and queries), and manages application-specific workflows. It translates requests from the API layer into domain operations and prepares data for presentation.
    *   **Dependencies**: `TaskManager.Domain`, `TaskManager.Shared`.
    *   **SOLID Principles**:
        *   **SRP**: Each command/query handler focuses on a single use case.
        *   **Open/Closed Principle (OCP)**: New features can be added by creating new command/query handlers without modifying existing ones.
        *   **Dependency Inversion Principle (DIP)**: Depends on abstractions (interfaces) defined in the Domain layer, not concrete implementations.
*   **`TaskManager.Domain` (Domain Layer Project)**:
    *   **Responsibility**: Contains the core business logic, entities, value objects, enums, and domain-specific interfaces (e.g., `ITaskRepository`). This layer is independent of any infrastructure concerns.
    *   **Dependencies**: None (it's the core).
    *   **SOLID Principles**:
        *   **SRP**: Entities focus on domain data and behavior.
        *   **Liskov Substitution Principle (LSP)**: Base entities and derived types behave as expected.
        *   **Interface Segregation Principle (ISP)**: Interfaces are granular and specific to clients.
        *   **DIP**: Defines abstractions that other layers will implement.
*   **`TaskManager.Infrastructure` (Infrastructure Layer Project)**:
    *   **Responsibility**: Provides concrete implementations for interfaces defined in the Domain layer. This includes data persistence (EF Core with Supabase), external service integrations, and background task implementations (timer functions).
    *   **Dependencies**: `TaskManager.Domain`, `TaskManager.Shared`.
    *   **SOLID Principles**:
        *   **SRP**: Each component (e.g., `TaskRepository`, `AppDbContext`) has a single responsibility.
        *   **OCP**: Can easily swap out data access technologies by implementing `ITaskRepository` differently.
        *   **DIP**: Implements abstractions from the Domain layer.
*   **`TaskManager.Shared` (Shared Utilities/Constants Project)**:
    *   **Responsibility**: Houses common utilities, constants, and potentially shared DTOs that are used across multiple layers but don't belong to a specific domain or application concern.
    *   **Dependencies**: None.
*   **`tests/`**: Dedicated projects for unit and integration tests for each layer, ensuring high code quality and adherence to behavior.

This layered architecture, combined with Dependency Injection (configured in `Program.cs` of `TaskManager.Api`), ensures a robust, maintainable, and scalable solution that strictly adheres to SOLID principles and enterprise best practices.


## 5. Authentication & Authorization

*   **Authentication:**
    *   **API Key:** A simple approach for internal/trusted clients. The API key would be passed in the `X-API-Key` header.
    *   **OAuth 2.0 / OpenID Connect:** For more robust security, integrate with Azure Active Directory (AAD) or another identity provider. Access tokens would be passed in the `Authorization: Bearer <token>` header.
*   **Authorization:**
    *   **Role-Based Access Control (RBAC):** Define roles (e.g., `User`, `Admin`) and assign permissions to perform specific actions on tasks. This would be enforced within the Azure Functions.

## 6. Error Handling

*   **Standard HTTP Status Codes:** Use appropriate HTTP status codes (e.g., 200, 201, 204, 400, 401, 403, 404, 409, 500).
*   **Consistent Error Response Format:** Return a JSON object for errors, including a `code`, `message`, and optionally `details` (e.g., validation errors).
    ```json
    {
      "code": "ValidationError",
      "message": "Invalid input for task creation.",
      "details": [
        { "field": "title", "error": "Title is required." }
      ]
    }
    ```
*   **Retry Mechanisms:** Clients should implement exponential backoff and retry logic for transient errors (e.g., 500, 503).

## 7. Considerations

*   **Offline Support:** The client application must be designed to queue changes while offline and synchronize them once connectivity is restored. The `updatedAt` timestamp is critical for this.
*   **Performance:** Optimize database queries and function execution for large datasets. Consider indexing relevant fields in the backend database.
*   **Security:**
    *   Always use HTTPS.
    *   Sanitize and validate all input to prevent injection attacks.
    *   Implement least privilege for database access.
    *   Secure API keys/tokens.
*   **Scalability:** Azure Functions are inherently scalable, but database design and query optimization are crucial for maintaining performance under heavy load.
*   **Recurrence Logic:** The Azure Functions should be capable of generating future recurrence instances based on the `RecurrencePattern` and `recurrenceEndDate`. This might involve a separate scheduled function.
*   **Archiving and Deletion:** Implement a background process (e.g., a Durable Function or a scheduled timer trigger) to permanently delete tasks marked `isDeleted` after a retention period, and to archive completed tasks after a certain duration.
