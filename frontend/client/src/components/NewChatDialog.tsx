import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users, MessageSquare, Search, X } from "lucide-react";
import { nanoid } from "nanoid";
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
import { Skeleton } from "@/components/ui/skeleton";
import { searchUsers, createGroupConversation } from "@/lib/queryClient";
import { Conversation } from "@shared/schema";

type UserType = {
  id: number;
  username: string;
};

type NewChatDialogProps = {
  onCreateChat: (data: Conversation) => void;
  trigger?: React.ReactNode;
};

export default function NewChatDialog({ onCreateChat, trigger }: NewChatDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"private" | "group">("private");
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data: filteredUsers, isLoading: isSearching } = useQuery({
    queryKey: ['users', debouncedSearch],
    queryFn: () => searchUsers(debouncedSearch),
    enabled: debouncedSearch.length > 0,
  });

  const handleSelectUser = (user: UserType) => {
    if (type === "private") {
      setSelectedUsers([user]);
    } else {
      setSelectedUsers(prev => [...prev, user].filter((u, i, arr) =>
          arr.findIndex(item => item.id === u.id) === i
      ));
    }
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      let newConversation: Conversation;

      if (type === "private") {
        if (selectedUsers.length !== 1) {
          throw new Error("Sélectionnez un utilisateur pour un chat privé");
        }

        newConversation = {
          id: selectedUsers[0].id,
          type: 'private',
          name: selectedUsers[0].username,
          createdAt: new Date(),
        };
      } else {
        const res = await createGroupConversation({
          name,
          members: selectedUsers.map(u => u.id)
        });

        newConversation = {
          id: res.room_id,
          type: 'group',
          name: res.name || `Groupe ${nanoid(4)}`,
          createdAt: new Date(res.created_at),
        };
      }

      onCreateChat(newConversation);
      setIsOpen(false);
      resetForm();

    } catch (error) {
      toast({
        title: "Erreur de création",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
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
                      required
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
                    placeholder="Rechercher par nom d'utilisateur"
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

            {isSearching ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
            ) : search && filteredUsers?.length > 0 ? (
                <ul className="border rounded-md divide-y max-h-32 overflow-y-auto">
                  {filteredUsers.map((user: UserType) => (
                      <li key={user.id}>
                        <button
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            className="w-full p-2 text-left hover:bg-muted"
                            disabled={selectedUsers.some(u => u.id === user.id)}
                        >
                          <span className="font-medium">{user.username}</span>
                        </button>
                      </li>
                  ))}
                </ul>
            ) : search && !isSearching ? (
                <div className="text-center text-muted-foreground py-4">
                  Aucun utilisateur trouvé
                </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSearching}>
              Créer la conversation
            </Button>
          </form>
        </DialogContent>
      </Dialog>
  );
}