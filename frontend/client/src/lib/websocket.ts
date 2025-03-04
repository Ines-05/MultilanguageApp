import { Message } from "@shared/schema";

let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;
const listeners: Map<number, ((message: Message) => void)[]> = new Map();

export function connectWebSocket(conversationId: number) {
  if (ws?.readyState === WebSocket.OPEN) {
    (ws as any).conversationId = conversationId;
    return;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  console.log("Connecting to WebSocket:", wsUrl);
  ws = new WebSocket(wsUrl);
  (ws as any).conversationId = conversationId;

  ws.onopen = () => {
    console.log("WebSocket connection established");
    reconnectAttempts = 0;
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message.error) {
        console.error("WebSocket error:", message.error);
        return;
      }

      // Notify listeners for this conversation
      const conversationListeners = listeners.get(message.conversationId) || [];
      conversationListeners.forEach((listener) => listener(message));
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed");
    ws = null;

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
      setTimeout(() => connectWebSocket(conversationId), RECONNECT_DELAY * reconnectAttempts);
    } else {
      console.error("Max reconnection attempts reached");
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
}

export function sendMessage(message: Omit<Message, "id" | "timestamp">) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error("WebSocket is not connected");
    return;
  }
  try {
    ws.send(JSON.stringify(message));
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

export function subscribeToMessages(conversationId: number, callback: (message: Message) => void) {
  if (!listeners.has(conversationId)) {
    listeners.set(conversationId, []);
  }

  const conversationListeners = listeners.get(conversationId)!;
  conversationListeners.push(callback);

  return () => {
    const conversationListeners = listeners.get(conversationId) || [];
    const index = conversationListeners.indexOf(callback);
    if (index > -1) {
      conversationListeners.splice(index, 1);
      if (conversationListeners.length === 0) {
        listeners.delete(conversationId);
      }
    }
  };
}