import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
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
import { Globe } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const registerSchema = insertUserSchema.extend({
  password: insertUserSchema.shape.password.min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: insertUserSchema.shape.password,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterData = InsertUser & { confirmPassword: string };

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { registerMutation, user } = useAuth();

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      defaultLanguage: "fr",
      languageLevel: "standard",
    },
  });

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const onSubmit = async (data: RegisterData) => {
    try {
      await registerMutation.mutateAsync(data);
      setLocation("/");
    } catch (error) {
      toast({
        title: "Erreur d'inscription",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
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
              <CardTitle>Créer un compte</CardTitle>
              <CardDescription>
                Rejoignez notre communauté multilingue
              </CardDescription>
            </CardHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                      id="username"
                      {...form.register("username")}
                  />
                  {form.formState.errors.username && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.username.message}
                      </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.email.message}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                      id="confirmPassword"
                      type="password"
                      {...form.register("confirmPassword")}
                  />
                  {form.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.confirmPassword.message}
                      </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Création..." : "Créer un compte"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Déjà un compte ?{" "}
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Se connecter
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
          <Globe className="w-16 h-16 mb-8 text-primary" />
          <h2 className="text-3xl font-bold text-center mb-4">
            Chat Multilingue Intelligent
          </h2>
          <p className="text-xl text-center text-muted-foreground max-w-md">
            Brisez les barrières linguistiques avec une traduction en temps réel.
            Créez votre compte pour commencer à chatter dans plusieurs langues.
          </p>
        </motion.div>
      </div>
  );
}