import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, Redirect } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: () => React.JSX.Element;
};

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  return (
    <Route
      path={path}
      component={() => {
        const { user, isLoading } = useAuth();

        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth/login" />;
        }

        return <Component />;
      }}
    />
  );
}