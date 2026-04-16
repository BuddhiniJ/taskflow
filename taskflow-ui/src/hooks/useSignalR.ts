import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import type { Task } from '../types';

interface UseSignalRProps {
  onTaskCreated: (task: Task) => void;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (data: { id: number }) => void;
}

export function useSignalR({ onTaskCreated, onTaskUpdated, onTaskDeleted }: UseSignalRProps) {
  const [isConnected, setIsConnected] = useState(false);
  // useRef keeps the connection object stable across re-renders
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Build the connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7232/hubs/tasks', {
        // SignalR can't send headers via WebSocket
        // so the token goes in the query string instead
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()  // retries: 0s, 2s, 10s, 30s
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Register event listeners BEFORE starting the connection
    connection.on('TaskCreated', onTaskCreated);
    connection.on('TaskUpdated', onTaskUpdated);
    connection.on('TaskDeleted', onTaskDeleted);

    // Handle reconnection events
    connection.onreconnecting(() => setIsConnected(false));
    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    // Start the connection
    connection.start()
      .then(() => {
        setIsConnected(true);
        console.log('SignalR connected');
      })
      .catch(err => console.error('SignalR connection error:', err));

    connectionRef.current = connection;

    // Cleanup — stop connection when component unmounts
    return () => {
      connection.stop();
    };
  }, []); // empty array = run once on mount

  return { isConnected };
}