import { useState } from "react";
import { Plus, Users, MessageSquare, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type NewChatDialogProps = {
  onCreateChat: (data: { type: "private" | "group"; name?: string; members: string[] }) => void;
  trigger?: React.ReactNode;
};

// Simuler une recherche d'utilisateurs
const mockUsers = [
  { id: 1, username: "alice", email: "alice@example.com" },
  { id: 2, username: "bob", email: "bob@example.com" },
  { id: 3, username: "charlie", email: "charlie@example.com" },
  { id: 4, username: "david", email: "david@example.com" },
];

export default function NewChatDialog({ onCreateChat, trigger }: NewChatDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"private" | "group">("private");
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<typeof mockUsers[0][]>([]);
  const { toast } = useToast();

  const filteredUsers = search
    ? mockUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleSelectUser = (user: typeof mockUsers[0]) => {
    if (type === "private") {
      setSelectedUsers([user]);
    } else {
      if (!selectedUsers.find((u) => u.id === user.id)) {
        setSelectedUsers((prev) => [...prev, user]);
      }
    }
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedUsers.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un utilisateur",
        variant: "destructive",
      });
      return;
    }

    if (type === "group" && !name) {
      toast({
        title: "Nom requis",
        description: "Veuillez saisir un nom pour le groupe",
        variant: "destructive",
      });
      return;
    }

    onCreateChat({
      type,
      name: type === "group" ? name : undefined,
      members: selectedUsers.map((u) => u.email),
    });

    setIsOpen(false);
    setType("private");
    setName("");
    setSearch("");
    setSelectedUsers([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle conversation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
          <DialogDescription>
            Créez une conversation privée ou un groupe de discussion.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={type === "private" ? "default" : "outline"}
              onClick={() => {
                setType("private");
                setSelectedUsers([]);
              }}
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <MessageSquare className="w-6 h-6" />
              <span>Chat Privé</span>
            </Button>
            <Button
              type="button"
              variant={type === "group" ? "default" : "outline"}
              onClick={() => setType("group")}
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <Users className="w-6 h-6" />
              <span>Groupe</span>
            </Button>
          </div>

          {type === "group" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom du groupe</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mon groupe"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Rechercher des utilisateurs
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom ou email"
                className="pl-8"
              />
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <Badge key={user.id} variant="secondary">
                  {user.username}
                  <button
                    type="button"
                    onClick={() => handleRemoveUser(user.id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {search && filteredUsers.length > 0 && (
            <ul className="border rounded-md divide-y max-h-32 overflow-y-auto">
              {filteredUsers.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className="w-full p-2 text-left hover:bg-muted flex flex-col"
                  >
                    <span className="font-medium">{user.username}</span>
                    <span className="text-sm text-muted-foreground">
                      {user.email}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Button type="submit" className="w-full">
            Créer la conversation
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}