namespace TaskFlow.Models
{
    public class TaskItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }  // ? means nullable
        public bool IsCompleted { get; set; } = false;
        public Priority Priority { get; set; } = Priority.Medium;
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key — which user owns this task
        public string UserId { get; set; } = string.Empty;

        // Navigation property — gives us access to the full User object
        public AppUser User { get; set; } = null!;
    }

    public enum Priority
    {
        Low = 1,
        Medium = 2,
        High = 3
    }
}
