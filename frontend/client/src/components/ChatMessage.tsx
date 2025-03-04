import { Message } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
  isOwn?: boolean;
}

export default function ChatMessage({ message, isOwn }: ChatMessageProps) {
  return (
    <div
      className={cn("flex", {
        "justify-end": isOwn,
      })}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-4 mb-3 shadow-sm transform transition-all",
          isOwn
            ? "bg-primary text-primary-foreground translate-x-1"
            : "bg-muted text-muted-foreground -translate-x-1"
        )}
      >
        <p className="text-base font-medium leading-relaxed">{message.content}</p>
        {message.translatedContent && (
          <div className="mt-2 pt-2 border-t border-primary/20">
            <p className="text-sm opacity-85 leading-relaxed">
              {message.translatedContent}
            </p>
          </div>
        )}
        <div className="text-xs mt-2 opacity-60 flex items-center gap-2">
          <span>{message.sender}</span>
          <span>•</span>
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}