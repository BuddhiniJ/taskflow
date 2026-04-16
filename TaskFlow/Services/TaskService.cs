using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Data;
using TaskFlow.DTOs;
using TaskFlow.Hubs;
using TaskFlow.Models;

namespace TaskFlow.Services
{
    public class TaskService : ITaskService
    {
        private readonly AppDbContext _db;
        private readonly IHubContext<TaskHub> _hub;

        public TaskService(AppDbContext db, IHubContext<TaskHub> hub)
        {
            _db = db;
            _hub = hub;
        }

        // GET all tasks belonging to this user
        public async Task<List<TaskResponse>> GetAllAsync(string userId)
        {
            return await _db.Tasks
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .AsNoTracking()
                .Select(t => MapToResponse(t))
                .ToListAsync();
        }

        // GET a single task — also checks it belongs to this user
        public async Task<TaskResponse?> GetByIdAsync(int id, string userId)
        {
            var task = await _db.Tasks
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            return task == null ? null : MapToResponse(task);
        }

        // CREATE a new task
        public async Task<TaskResponse> CreateAsync(CreateTaskRequest req, string userId)
        {
            var task = new TaskItem
            {
                Title = req.Title,
                Description = req.Description,
                Priority = req.Priority,
                DueDate = req.DueDate,
                UserId = userId
            };

            _db.Tasks.Add(task);
            await _db.SaveChangesAsync();

            var response = MapToResponse(task);

            // ── Push real-time notification ──────────────────────────────────
            // "TaskCreated" is the event name — the React client listens for this
            // Clients.All = every connected client gets this push
            await _hub.Clients.All.SendAsync("TaskCreated", response);

            return response;
        }

        // UPDATE an existing task
        public async Task<bool> UpdateAsync(int id, UpdateTaskRequest req, string userId)
        {
            var task = await _db.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (task == null) return false;

            task.Title = req.Title;
            task.Description = req.Description;
            task.IsCompleted = req.IsCompleted;
            task.Priority = req.Priority;
            task.DueDate = req.DueDate;

            await _db.SaveChangesAsync();

            // Push update notification to all clients
            await _hub.Clients.All.SendAsync("TaskUpdated", MapToResponse(task));

            return true;
        }

        // DELETE a task
        public async Task<bool> DeleteAsync(int id, string userId)
        {
            var task = await _db.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (task == null) return false;

            _db.Tasks.Remove(task);
            await _db.SaveChangesAsync();

            // Push delete notification — clients just need the ID to remove it from UI
            await _hub.Clients.All.SendAsync("TaskDeleted", new { id });

            return true;
        }

        // ── Private helper — converts TaskItem (DB model) to TaskResponse (DTO)
        private static TaskResponse MapToResponse(TaskItem t) => new()
        {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            IsCompleted = t.IsCompleted,
            Priority = t.Priority,
            DueDate = t.DueDate,
            CreatedAt = t.CreatedAt,
            UserId = t.UserId
        };
    }
}
