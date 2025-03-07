import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { BASE_URL } from "./config";
import {Message} from "@shared/schema.ts";


async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
    method: string,
    path: string,
    data?: unknown,
): Promise<Response> {
  const url = `${BASE_URL}${path}`;
  const token = localStorage.getItem("auth_user")
      ? JSON.parse(localStorage.getItem("auth_user")!).token
      : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
    ({ on401: unauthorizedBehavior }) =>
        async ({ queryKey }) => {
          const [path] = queryKey as [string];
          return apiRequest("GET", path).then((res) => res.json());
        };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// API functions
export const fetchConversations = async (): Promise<any> => {
  const [privateRes, groupRes] = await Promise.all([
    apiRequest("GET", "/conversations/private"),
    apiRequest("GET", "/conversations/group"),
  ]);

  const privateConvos = await privateRes.json();
  const groupConvos = await groupRes.json();

  return {
    private: privateConvos.map((c: any) => ({
      id: c.id,
      type: 'private' as const,
      name: c.username,
      createdAt: new Date(c.created_at),
    })),
    group: groupConvos.map((c: any) => ({
      id: c.room_id,
      type: 'group' as const,
      name: c.name,
      createdAt: new Date(c.created_at),
    })),
  };
};

export const searchUsers = async (query: string): Promise<any> => {
  const res = await apiRequest("GET", `/users/search?username=${query}`);
  return res.json();
};

export const createPrivateConversation = async (receiver_id: number): Promise<any> => {
  const res = await apiRequest("POST", "/conversations/private", { receiver_id });
  return res.json();
};

export const createGroupConversation = async (data: {
  name: string;
  members: number[];
}): Promise<any> => {
  const res = await apiRequest("POST", "/conversations/group", data);
  return res.json();
};

export const fetchPrivateMessages = async (otherUserId: number): Promise<Message[]> => {
  const res = await apiRequest("GET", `/private_messages/${otherUserId}`);
  const data = await res.json();
  return data.messages.map((msg: any) => ({
    id: msg.id,
    content: msg.content,
    translatedContent: msg.translated_content || msg.content, // Ajuster selon le backend
    fromLanguage: 'en', // Par défaut ou depuis le backend
    toLanguage: 'fr',
    sender: msg.sender_id,
    conversationId: otherUserId,
    timestamp: new Date(msg.timestamp),
  }));
};

export const fetchGroupMessages = async (roomId: number): Promise<Message[]> => {
  const res = await apiRequest("GET", `/history/${roomId}`);
  const data = await res.json();
  return data.messages.map((msg: any) => ({
    id: msg.id,
    content: msg.content,
    translatedContent: msg.translated_content || msg.content,
    fromLanguage: 'en',
    toLanguage: 'fr',
    sender: msg.user_id,
    conversationId: roomId,
    timestamp: new Date(msg.timestamp),
  }));
};