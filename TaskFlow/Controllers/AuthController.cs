using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TaskFlow.Models;
using static TaskFlow.DTOs.AuthDTOs;

namespace TaskFlow.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IConfiguration _config;

        public AuthController(UserManager<AppUser> userManager, IConfiguration config)
        {
            _userManager = userManager;
            _config = config;
        }

        // POST /api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            // Check if email already exists
            var existingUser = await _userManager.FindByEmailAsync(req.Email);
            if (existingUser != null)
                return BadRequest("Email already in use.");

            // Create the new user object
            var user = new AppUser
            {
                FullName = req.FullName,
                Email = req.Email,
                UserName = req.Email  // Identity uses UserName internally, we set it = Email
            };

            // Identity hashes the password automatically — never store plain text
            var result = await _userManager.CreateAsync(user, req.Password);

            if (!result.Succeeded)
            {
                // Return all validation errors (e.g. "Password too short")
                var errors = result.Errors.Select(e => e.Description);
                return BadRequest(errors);
            }

            return Ok("Registration successful. You can now log in.");
        }

        // POST /api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            // Find user by email
            var user = await _userManager.FindByEmailAsync(req.Email);
            if (user == null)
                return Unauthorized("Invalid email or password.");

            // Check password (Identity compares hash — never sees plain text)
            var passwordValid = await _userManager.CheckPasswordAsync(user, req.Password);
            if (!passwordValid)
                return Unauthorized("Invalid email or password.");

            // Generate JWT token
            var token = GenerateJwtToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                Email = user.Email!,
                FullName = user.FullName
            });
        }

        // ── Private helper — builds the JWT token ────────────────────────────
        private string GenerateJwtToken(AppUser user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Claims are pieces of data embedded inside the token
            // The client can read these without calling the server
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),   // user's ID
                new Claim(ClaimTypes.Email,          user.Email!),
                new Claim("FullName",                user.FullName)
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
