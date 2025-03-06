import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { loginMutation, user } = useAuth();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (user) {
    setLocation("/");
    return null;
  }

  const onSubmit = async (data: LoginData) => {
    try {
      await loginMutation.mutateAsync(data);
      setLocation("/");
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Nom d'utilisateur ou mot de passe incorrect",
        variant: "destructive",
      });
    }
  };

  return (
      <div className="min-h-screen grid lg:grid-cols-2">
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-center p-8"
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Connexion</CardTitle>
              <CardDescription>
                Connectez-vous à votre compte pour accéder à vos conversations
              </CardDescription>
            </CardHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Nom d'utilisateur</Label>
                  <Input
                      id="username"
                      type="text"
                      placeholder="Votre nom d'utilisateur"
                      {...form.register("username")}
                  />
                  {form.formState.errors.username && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.username.message}
                      </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                      id="password"
                      type="password"
                      {...form.register("password")}
                  />
                  {form.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.password.message}
                      </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Connexion..." : "Se connecter"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Pas encore de compte ?{" "}
                  <Link href="/auth/register" className="text-primary hover:underline">
                    Créer un compte
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:flex flex-col items-center justify-center p-8 bg-muted"
        >
          <h2 className="text-3xl font-bold text-center mb-4">
            Chat Multilingue Intelligent
          </h2>
          <p className="text-xl text-center text-muted-foreground max-w-md">
            Brisez les barrières linguistiques avec une traduction en temps réel.
            Connectez-vous avec n'importe qui, n'importe où.
          </p>
        </motion.div>
      </div>
  );
}