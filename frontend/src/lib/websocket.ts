// WebSocket connection manager for real-time updates

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

type MessageHandler = (data: WebSocketMessage) => void;

export interface WebSocketMessage {
  type: "NEW_QUESTION" | "QUESTION_ANSWERED" | "QUESTION_UPDATED" | "QUESTION_DELETED";
  data: unknown;
}

class WebSocketManager {
  private socket: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;

  connect() {
    // Prevent multiple connections
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.socket = new WebSocket(WS_URL);

      this.socket.onopen = () => {
        console.log("✓ WebSocket connected");
        this.isConnecting = false;
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          // Notify all handlers
          this.handlers.forEach((handler) => handler(message));
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      this.socket.onclose = () => {
        console.log("WebSocket disconnected");
        this.isConnecting = false;
        this.socket = null;
        
        // Auto-reconnect after 3 seconds
        this.reconnectTimeout = setTimeout(() => {
          this.connect();
        }, 3000);
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnecting = false;
      };
    } catch (err) {
      console.error("Failed to connect WebSocket:", err);
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  subscribe(handler: MessageHandler) {
    this.handlers.add(handler);
    
    // Connect if not already connected
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.connect();
    }

    // Return unsubscribe function
    return () => {
      this.handlers.delete(handler);
    };
  }
}

// Singleton instance
export const wsManager = new WebSocketManager();

