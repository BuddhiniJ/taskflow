using Microsoft.AspNetCore.Identity;

namespace TaskFlow.Models
{
    public class AppUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property — one user has many tasks
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    }
}
