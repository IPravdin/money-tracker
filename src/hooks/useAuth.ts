import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  name?: string;
  password: string;
  confirmPassword: string;
}

// API functions
async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/me");
    if (response.status === 401) {
      return null;
    }
    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

async function login(data: LoginData): Promise<User> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }
  
  const result = await response.json();
  return result.user;
}

async function register(data: RegisterData): Promise<User> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }
  
  const result = await response.json();
  return result.user;
}

async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });
  
  if (!response.ok) {
    throw new Error("Logout failed");
  }
}

// Custom hook
export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  // Query for current user
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "user"], user);
      router.push("/dashboard");
    },
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "user"], user);
      router.push("/dashboard");
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "user"], null);
      queryClient.clear(); // Clear all cached data
      router.push("/login");
    },
  });
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logoutError: logoutMutation.error,
  };
}