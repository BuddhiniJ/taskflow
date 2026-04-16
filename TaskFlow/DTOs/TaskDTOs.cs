using System.ComponentModel.DataAnnotations;
using TaskFlow.Models;

namespace TaskFlow.DTOs
{
    // What the client sends when CREATING a task
    public class CreateTaskRequest
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public Priority Priority { get; set; } = Priority.Medium;

        public DateTime? DueDate { get; set; }
    }

    // What the client sends when UPDATING a task
    public class UpdateTaskRequest
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public bool IsCompleted { get; set; }

        public Priority Priority { get; set; } = Priority.Medium;

        public DateTime? DueDate { get; set; }
    }

    // What the API sends BACK to the client
    public class TaskResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsCompleted { get; set; }
        public Priority Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UserId { get; set; } = string.Empty;
    }
}
