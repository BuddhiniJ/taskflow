using TaskFlow.DTOs;

namespace TaskFlow.Services
{
    public interface ITaskService
    {
        Task<List<TaskResponse>> GetAllAsync(string userId);
        Task<TaskResponse?> GetByIdAsync(int id, string userId);
        Task<TaskResponse> CreateAsync(CreateTaskRequest req, string userId);
        Task<bool> UpdateAsync(int id, UpdateTaskRequest req, string userId);
        Task<bool> DeleteAsync(int id, string userId);
    }
}
