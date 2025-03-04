import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = LoginData & {
  username: string;
  defaultLanguage?: string;
  languageLevel?: string;
};

type AuthContextType = {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginPending, setLoginPending] = useState(false);
  const [registerPending, setRegisterPending] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const loginMutation = {
    mutateAsync: async (credentials: LoginData) => {
      setLoginPending(true);
      try {
        // Simuler une requête API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Pour la démo, on accepte n'importe quelles credentials
        const mockUser: User = {
          id: 1,
          email: credentials.email,
          username: credentials.email.split('@')[0],
          password: '',  // On ne stocke jamais le mot de passe
          defaultLanguage: 'fr',
          languageLevel: 'standard',
          createdAt: new Date(),
        };

        setUser(mockUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
        return mockUser;
      } catch (error) {
        toast({
          title: "Erreur de connexion",
          description: error instanceof Error ? error.message : "Une erreur est survenue",
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
      try {
        // Simuler une requête API
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockUser: User = {
          id: 1,
          email: data.email,
          username: data.username,
          password: '',
          defaultLanguage: data.defaultLanguage || 'fr',
          languageLevel: data.languageLevel || 'standard',
          createdAt: new Date(),
        };

        setUser(mockUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
        return mockUser;
      } catch (error) {
        toast({
          title: "Erreur d'inscription",
          description: error instanceof Error ? error.message : "Une erreur est survenue",
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
        error: null,
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