import { Client } from '@stomp/stompjs';

class GameStompClient {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map(); // id -> { topic, callback, stompSub }
    this.subIdCounter = 0;
    this.onConnectCallbacks = new Set();
    this.onErrorCallbacks = new Set();
    this.isConnecting = false;
  }

  connect(wsUrl) {
    if (!wsUrl) {
      const envUrl = import.meta.env.VITE_BACKEND_URL;
      if (envUrl) {
        const clean = envUrl.replace(/\/$/, '');
        const wsProto = clean.startsWith('https') ? 'wss:' : 'ws:';
        const host = clean.replace(/^https?:\/\//, '');
        wsUrl = `${wsProto}//${host}/ws`;
      } else {
        const loc = window.location;
        const wsProto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${wsProto}//${loc.hostname}:8080/ws`;
      }
    }

    if (this.client && (this.connected || this.isConnecting)) {
      return Promise.resolve();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      this.client = new Client({
        brokerURL: wsUrl,
        reconnectDelay: 3000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: (str) => {
          if (import.meta.env.DEV) {
            // console.debug('[STOMP]', str);
          }
        },
        onConnect: () => {
          this.connected = true;
          this.isConnecting = false;

          // Re-activate all registered subscriptions
          this.subscriptions.forEach((sub, id) => {
            this._activateSubscription(id, sub);
          });

          this.onConnectCallbacks.forEach((cb) => {
            try { cb(); } catch (e) { console.error(e); }
          });

          resolve();
        },
        onStompError: (frame) => {
          console.error('[STOMP] Error frame:', frame.headers['message'], frame.body);
          this.onErrorCallbacks.forEach((cb) => {
            try { cb(frame); } catch (e) { console.error(e); }
          });
          reject(frame);
        },
        onWebSocketClose: () => {
          this.connected = false;
          this.isConnecting = false;
          // Mark subscriptions as inactive until reconnection
          this.subscriptions.forEach((sub) => {
            sub.stompSub = null;
          });
        },
        onWebSocketError: (err) => {
          console.error('[STOMP] WebSocket transport error:', err);
          this.isConnecting = false;
        },
      });

      this.client.activate();
    });
  }

  _activateSubscription(id, sub) {
    if (!this.client || !this.connected) return;

    try {
      // Unsubscribe previous handle if any
      if (sub.stompSub) {
        try { sub.stompSub.unsubscribe(); } catch (e) {}
      }

      sub.stompSub = this.client.subscribe(sub.topic, (message) => {
        try {
          const payload = JSON.parse(message.body);
          sub.callback(payload);
        } catch (e) {
          sub.callback(message.body);
        }
      });
    } catch (e) {
      console.error('[STOMP] Failed to subscribe to', sub.topic, e);
    }
  }

  onConnect(callback) {
    this.onConnectCallbacks.add(callback);
    if (this.connected) {
      callback();
    }
    return () => this.onConnectCallbacks.delete(callback);
  }

  onError(callback) {
    this.onErrorCallbacks.add(callback);
    return () => this.onErrorCallbacks.delete(callback);
  }

  subscribe(topic, callback) {
    const id = ++this.subIdCounter;
    const subRecord = { topic, callback, stompSub: null };
    this.subscriptions.set(id, subRecord);

    if (this.connected) {
      this._activateSubscription(id, subRecord);
    }

    // Return cleanup function
    return () => {
      const existing = this.subscriptions.get(id);
      if (existing && existing.stompSub) {
        try {
          existing.stompSub.unsubscribe();
        } catch (e) {
          // ignore
        }
      }
      this.subscriptions.delete(id);
    };
  }

  send(destination, payload = {}) {
    if (!this.client || !this.connected) {
      console.warn('[STOMP] Cannot send before connecting:', destination);
      return false;
    }
    this.client.publish({
      destination,
      body: JSON.stringify(payload),
    });
    return true;
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.isConnecting = false;
      this.subscriptions.clear();
      this.onConnectCallbacks.clear();
      this.onErrorCallbacks.clear();
    }
  }
}

export const stompService = new GameStompClient();
