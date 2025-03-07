import { Message } from "@shared/schema";
import { BASE_URL, WS_BASE_URL } from "./config";

let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;
const listeners: Map<string, ((message: Message) => void)[]> = new Map();

export function connectWebSocket(
    type: "group" | "private",
    roomIdOrUserId: number,
    currentUserId:number,
) {
  const token = localStorage.getItem("auth_user")
      ? JSON.parse(localStorage.getItem("auth_user")!).token
      : null;

  if (ws?.readyState === WebSocket.OPEN) {
    if ((ws as any).currentConnection === `${type}_${roomIdOrUserId}`) {
      return;
    } else {
      ws.close();
    }
  }
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  let wsUrl = "";

  if (type === "group") {
    wsUrl = `${protocol}//localhost:8000/ws/${roomIdOrUserId}?token=${token}`;
  } else if (type === "private") {
    wsUrl = `${protocol}//localhost:8000/ws_private/${roomIdOrUserId}?token=${token}`;
  }
  console.log("Connecting to WebSocket:", wsUrl);
  ws = new WebSocket(wsUrl);
  (ws as any).currentConnection = `${type}_${roomIdOrUserId}`;

  ws.onopen = () => {
    console.log("WebSocket connection established");
    reconnectAttempts = 0;

  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);

      if (message.error) {
        console.error("WebSocket error:", message.error);
        if (message.error === "auth_failed") {
          ws?.close();
        }
        return;
      }

      const conversationId = message.conversationId || message.room_id;
      if (conversationId) {
        const listenersGroup = listeners.get(conversationId) || [];
        listenersGroup.forEach(callback => callback(message));
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed");
    ws = null;

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts);
      reconnectAttempts++;
      console.log(`Reconnecting in ${delay}ms...`);
      setTimeout(() => connectWebSocket(type, roomIdOrUserId,currentUserId), delay);
    } else {
      console.error("Max reconnection attempts reached");
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return ws;
}

export function sendMessage(message: Partial<Message> & { receiver_id?: string }) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error("WebSocket is not connected");
    return false;
  }

  try {
    const fullMessage = {
      ...message,
      timestamp: new Date().toISOString(),
      from_language: message.fromLanguage,
    };

    delete fullMessage.fromLanguage;

    ws.send(JSON.stringify(fullMessage));
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
}

export function subscribeToMessages(
    conversationId: string,
    callback: (message: Message) => void
) {
  if (!listeners.has(conversationId)) {
    listeners.set(conversationId, []);
  }

  const conversationListeners = listeners.get(conversationId)!;
  conversationListeners.push(callback);

  return () => {
    const updatedListeners = (listeners.get(conversationId) || [])
        .filter(l => l !== callback);

    if (updatedListeners.length > 0) {
      listeners.set(conversationId, updatedListeners);
    } else {
      listeners.delete(conversationId);
    }
  };
}

export function disconnectWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}

export function getCurrentConnection() {
  return ws ? (ws as any).currentConnection : null;
}