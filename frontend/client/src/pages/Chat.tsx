import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Message, Conversation, type LanguageCode } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Plus } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import ConversationList from "@/components/ConversationList";
import NewChatDialog from "@/components/NewChatDialog";
import { simulateTranslation } from "@/lib/translations";
import { connectWebSocket, sendMessage, subscribeToMessages, disconnectWebSocket } from "@/lib/websocket";
import { fetchConversations, createPrivateConversation, createGroupConversation, fetchPrivateMessages, fetchGroupMessages } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState("");
  const [fromLang, setFromLang] = useState<LanguageCode>("en");
  const [toLang, setToLang] = useState<LanguageCode>("fr");
  const [isTyping, setIsTyping] = useState(false);

  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    enabled: !!user,
  });

  const createConversationMutation = useMutation({
    mutationFn: (data: Conversation) => {
      return data.type === 'private'
          ? createPrivateConversation(data.id)
          : createGroupConversation({ name: data.name, members: [data.id] });
    },
    onSuccess: (newConv) => {
      queryClient.setQueryData(['conversations'], (old: Conversation[] | undefined) =>
          old ? [...old, newConv] : [newConv]
      );
    }
  });

  const conversations = [
    ...(conversationsData?.private || []),
    ...(conversationsData?.group || []),
  ];

  const { data: messagesData } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation || !user) return [];
      return selectedConversation.type === 'private'
          ? await fetchPrivateMessages(selectedConversation.id)
          : await fetchGroupMessages(selectedConversation.id);
    },
    enabled: !!selectedConversation,
  });

  useEffect(() => {
    if (!selectedConversation || !user?.id) return;

    connectWebSocket(
        selectedConversation.type,
        selectedConversation.id,
        user.id
    );

    const unsubscribe = subscribeToMessages(
        selectedConversation.id.toString(),
        (message) => {
          queryClient.setQueryData(
              ['messages', selectedConversation.id],
              (old: Message[] | undefined) => {
                const exists = old?.some(m => m.id === message.id);
                return exists ? old : [...(old || []), message];
              }
          );
        }
    );

    return () => {
      unsubscribe();
      disconnectWebSocket();
    };
  }, [selectedConversation, user, queryClient]);

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

  const handleSend = async () => {
    if (!input.trim() || !selectedConversation || !user) return;

    let translatedText = preview;
    if (!translatedText) {
      setIsTyping(true);
      translatedText = await simulateTranslation(input, fromLang, toLang);
      setIsTyping(false);
    }

    const messagePayload = {
      content: input,
      from_language: fromLang,
      to_language: toLang,
      sender: user.id.toString(),
      conversationId: selectedConversation.id.toString(),
      translatedContent: translatedText,
      ...(selectedConversation.type === 'private' && {
        receiver_id: selectedConversation.id.toString()
      })
    };

    const success = sendMessage(messagePayload);

    if (success) {
      setInput("");
      setPreview("");
    } else {
      toast({
        title: "Erreur d'envoi",
        description: "La connexion au chat a échoué",
        variant: "destructive"
      });
    }
  };

  const handleCreateConversation = async (conversation: Conversation) => {
    try {
      const newConv = await createConversationMutation.mutateAsync(conversation);
      setSelectedConversation(newConv);
    } catch (error: any) {
      toast({
        title: "Erreur de création",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
      <div className="h-[calc(100vh-5rem)] grid grid-cols-[300px_1fr] gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <NewChatDialog
                  onCreateChat={handleCreateConversation}
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
          <Card className="flex-1 overflow-hidden">
            <CardContent className="h-[calc(100vh-16rem)] p-4 overflow-y-auto">
              {selectedConversation ? (
                  messagesData && messagesData.length > 0 ? (
                      <div className="space-y-4">
                        {messagesData.map((message) => (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                isOwn={message.sender === user?.id}
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