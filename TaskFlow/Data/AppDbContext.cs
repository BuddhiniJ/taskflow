using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Models;

namespace TaskFlow.Data
{
    // IdentityDbContext<AppUser> gives us the Identity tables
    // (Users, Roles, UserRoles etc.) automatically
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // This represents the Tasks table in the database
        public DbSet<TaskItem> Tasks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Always call base — Identity needs this to set up its tables
            base.OnModelCreating(modelBuilder);

            // Configure the relationship explicitly
            modelBuilder.Entity<TaskItem>()
                .HasOne(t => t.User)        // TaskItem has one User
                .WithMany(u => u.Tasks)     // User has many Tasks
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade); // delete tasks when user is deleted

            // Add an index on UserId — every query filters by user,
            // without this index it would do a full table scan every time
            modelBuilder.Entity<TaskItem>()
                .HasIndex(t => t.UserId);

            // Limit title column size in the DB
            modelBuilder.Entity<TaskItem>()
                .Property(t => t.Title)
                .HasMaxLength(200);
        }
    }
}
