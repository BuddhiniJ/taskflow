import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  isAuthenticated: boolean;
}

// Create the context with a default value of null
const AuthContext = createContext<AuthContextType | null>(null);

// Provider wraps the whole app — any component inside can read the context
export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage so login persists on page refresh
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const loginUser = (user: User) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', user.token);
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loginUser,
      logoutUser,
      isAuthenticated: !!user  // !! converts to boolean
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — any component calls useAuth() to get user info
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}