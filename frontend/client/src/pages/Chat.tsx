import { useEffect, useState } from "react";
import { Message, Conversation, type LanguageCode } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Plus } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import ConversationList from "@/components/ConversationList";
import LanguageSelector from "@/components/LanguageSelector";
import NewChatDialog from "@/components/NewChatDialog";
import { simulateTranslation } from "@/lib/translations";
import { nanoid } from "nanoid";

export default function Chat() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    // Mock data for frontend-only version
    return [
      {
        id: 1,
        type: "private" as const,
        name: null,
        createdAt: new Date(),
      },
      {
        id: 2,
        type: "group" as const,
        name: "Groupe de français",
        createdAt: new Date(),
      },
    ];
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState("");
  const [fromLang, setFromLang] = useState<LanguageCode>("en");
  const [toLang, setToLang] = useState<LanguageCode>("fr");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (input) {
      setIsTyping(true);
      timeout = setTimeout(async () => {
        const translated = await simulateTranslation(input, fromLang, toLang);
        setPreview(translated);
        setIsTyping(false);
      }, 300);
    } else {
      setPreview("");
      setIsTyping(false);
    }
    return () => clearTimeout(timeout);
  }, [input, fromLang, toLang]);

  const handleSend = () => {
    if (!input.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: parseInt(nanoid()),
      content: input,
      translatedContent: preview,
      fromLanguage: fromLang,
      toLanguage: toLang,
      sender: "user",
      conversationId: selectedConversation.id,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setPreview("");
  };

  const handleCreateChat = (data: { type: "private" | "group"; name?: string; members: string[] }) => {
    const newConversation: Conversation = {
      id: conversations.length + 1,
      type: data.type,
      name: data.name ?? null,
      createdAt: new Date(),
    };

    setConversations((prev) => [...prev, newConversation]);
    setSelectedConversation(newConversation);
  };

  return (
    <div className="h-[calc(100vh-5rem)] grid grid-cols-[300px_1fr] gap-6">
      <Card className="overflow-hidden">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Conversations</CardTitle>
            <NewChatDialog
              onCreateChat={handleCreateChat}
              trigger={
                <Button size="icon" variant="ghost">
                  <Plus className="w-4 h-4" />
                </Button>
              }
            />
          </div>
        </CardHeader>
        <div className="overflow-y-auto h-[calc(100vh-12rem)]">
          <ConversationList
            selectedId={selectedConversation?.id}
            onSelect={setSelectedConversation}
            conversations={conversations}
          />
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="p-4 flex flex-wrap items-center gap-4 bg-muted/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">De :</span>
            <LanguageSelector value={fromLang} onChange={setFromLang} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">À:</span>
            <LanguageSelector value={toLang} onChange={setToLang} />
          </div>
        </Card>

        <Card className="flex-1 overflow-hidden">
          <CardContent className="h-[calc(100vh-16rem)] p-4 overflow-y-auto">
            {selectedConversation ? (
              messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isOwn={message.sender === "user"}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Commencez une conversation !
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Sélectionnez une conversation pour commencer à chatter
              </div>
            )}
          </CardContent>
        </Card>

        {selectedConversation && (
          <div className="space-y-3">
            {(isTyping || preview) && (
              <div className="px-4 py-2 text-sm text-muted-foreground bg-muted/50 rounded-lg">
                {isTyping ? (
                  <span className="animate-pulse">Traduction en cours...</span>
                ) : (
                  preview
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Tapez votre message..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}