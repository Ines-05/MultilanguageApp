import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {AuthUser, User} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { BASE_URL } from "@/lib/config";

type LoginData = {
  username: string;  // Changed from email to username to match backend
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  defaultLanguage?: string;
  languageLevel?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: {
    mutateAsync: (data: LoginData) => Promise<User>;
    isPending: boolean;
  };
  logoutMutation: {
    mutate: () => void;
    isPending: boolean;
  };
  registerMutation: {
    mutateAsync: (data: RegisterData) => Promise<User>;
    isPending: boolean;
  };
};

const STORAGE_KEY = "auth_user";

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [loginPending, setLoginPending] = useState(false);
  const [registerPending, setRegisterPending] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser) as AuthUser;
        setUser(userData);
        // Verify the token is still valid
        validateToken(userData.token);
      } catch (err) {
        console.error("Failed to parse stored user data", err);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`${BASE_URL}/protected`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Token is invalid or expired
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.error("Token validation error", err);
    }
  };

  const loginMutation = {
    mutateAsync: async (credentials: LoginData) => {
      setLoginPending(true);
      setError(null);

      try {
        // Create FormData to match OAuth2PasswordRequestForm expected by FastAPI
        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        const response = await fetch(`${BASE_URL}/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Login failed');
        }

        const authData = await response.json();
        console.log(authData);

        // Fetch user details
        const userResponse = await fetch(`${BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${authData.access_token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();

        // Combine auth data with user data
        const user:AuthUser = {
          ...userData,
          token:authData.access_token,
        };

        setUser(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return user;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Login failed";
        setError(error instanceof Error ? error : new Error(errorMessage));
        toast({
          title: "Login Error",
          description: errorMessage,
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoginPending(false);
      }
    },
    isPending: loginPending,
  };

  const registerMutation = {
    mutateAsync: async (data: RegisterData) => {
      setRegisterPending(true);
      setError(null);

      try {
        // Create user
        const createResponse = await fetch(`${BASE_URL}/create_user/${data.username}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: data.password,
            default_language: data.defaultLanguage,
            language_level: data.languageLevel
          })
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.detail || 'Registration failed');
        }

        // Login with newly created credentials
        return await loginMutation.mutateAsync({
          username: data.username,
          password: data.password
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Registration failed";
        setError(error instanceof Error ? error : new Error(errorMessage));
        toast({
          title: "Registration Error",
          description: errorMessage,
          variant: "destructive",
        });
        throw error;
      } finally {
        setRegisterPending(false);
      }
    },
    isPending: registerPending,
  };

  const logoutMutation = {
    mutate: () => {
      setLogoutPending(true);
      try {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      } finally {
        setLogoutPending(false);
      }
    },
    isPending: logoutPending,
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            isLoading,
            error,
            loginMutation,
            logoutMutation,
            registerMutation,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}