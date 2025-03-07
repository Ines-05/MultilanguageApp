import { Conversation } from "@shared/schema";
import { MessageSquare, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  selectedId?: number;
  onSelect: (conversation: Conversation) => void;
  conversations: Conversation[];
}

export default function ConversationList({ selectedId, onSelect, conversations }: ConversationListProps) {
  return (
    <div className="space-y-2 p-4">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation)}
          className={cn(
            "w-full p-4 flex items-center gap-3 rounded-lg transition-colors",
            selectedId === conversation.id
              ? "bg-primary/10 hover:bg-primary/15"
              : "hover:bg-muted"
          )}
        >
          {conversation.type === "private" ? (
            <MessageSquare className="w-5 h-5 text-primary" />
          ) : (
            <Users className="w-5 h-5 text-primary" />
          )}
          <div className="text-left">
            <p className="font-medium">
              {conversation.name}
            </p>
            {conversation.type === "group" && (
              <p className="text-sm text-muted-foreground">
                Groupe
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}