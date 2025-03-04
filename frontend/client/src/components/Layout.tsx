import { Link, useLocation } from "wouter";
import { MessageSquare, User, History, Settings, Globe, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", icon: Globe, label: "Accueil" },
  { href: "/chat", icon: MessageSquare, label: "Chat" },
  { href: "/profile", icon: User, label: "Profil" },
  { href: "/history", icon: History, label: "Historique" },
  { href: "/settings", icon: Settings, label: "Paramètres" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-xl">
              <Globe className="h-6 w-6" />
              MultiLingual Chat
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 ml-6">
            {user && NAV_ITEMS.map(({ href, label }) => (
              <Link key={href} href={href}>
                <a className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === href ? "text-primary" : "text-muted-foreground"
                }`}>
                  {label}
                </a>
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                {/* Mobile Menu */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64">
                    <nav className="flex flex-col gap-4 mt-4">
                      {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
                        <Link key={href} href={href}>
                          <a
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                              location === href
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-primary/5"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                            {label}
                          </a>
                        </Link>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                      >
                        {logoutMutation.isPending ? "Déconnexion..." : "Se déconnecter"}
                      </Button>
                    </nav>
                  </SheetContent>
                </Sheet>
                <Button
                  variant="outline"
                  onClick={() => logoutMutation.mutate()}
                  className="hidden md:block"
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Déconnexion..." : "Se déconnecter"}
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost">Se connecter</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>S'inscrire</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}