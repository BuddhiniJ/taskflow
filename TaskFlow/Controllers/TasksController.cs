using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskFlow.DTOs;
using TaskFlow.Services;

namespace TaskFlow.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]   // every endpoint in this controller requires a valid JWT
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _tasks;

        public TasksController(ITaskService tasks)
        {
            _tasks = tasks;
        }

        // Helper — extracts the logged-in user's ID from the JWT token
        private string GetUserId() =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // GET /api/tasks
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tasks = await _tasks.GetAllAsync(GetUserId());
            return Ok(tasks);
        }

        // GET /api/tasks/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var task = await _tasks.GetByIdAsync(id, GetUserId());
            return task is null ? NotFound() : Ok(task);
        }

        // POST /api/tasks
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTaskRequest req)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var created = await _tasks.CreateAsync(req, GetUserId());

            // 201 Created — tells the client where to find the new resource
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT /api/tasks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskRequest req)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var ok = await _tasks.UpdateAsync(id, req, GetUserId());
            return ok ? NoContent() : NotFound();
        }

        // DELETE /api/tasks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _tasks.DeleteAsync(id, GetUserId());
            return ok ? NoContent() : NotFound();
        }
    }
}
