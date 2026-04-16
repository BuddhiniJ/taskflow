using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

namespace TaskFlow.Hubs
{
    [Authorize]
    public class TaskHub : Hub
    {
        // Called when a client connects
        public override async Task OnConnectedAsync()
        {
            // Add user to their own private group
            // Group name = their user ID
            // This lets us push notifications to one specific user later
            await Groups.AddToGroupAsync(Context.ConnectionId, Context.UserIdentifier!);
            await base.OnConnectedAsync();
        }

        // Called when a client disconnects (browser closed, lost connection etc.)
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, Context.UserIdentifier!);
            await base.OnDisconnectedAsync(exception);
        }

        // Client can call this to join a shared "room"
        // Useful later if you add team/shared task lists
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }
    }
}
