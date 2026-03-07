import { ALLOWED_ORIGINS } from '../constants';
import { type IframeMessage, type ParentMessage, isIframeMessage } from '@shared/types/messages';

type MessageHandler<T extends IframeMessage['type']> = (
  payload: Extract<IframeMessage, { type: T }>
) => void;

export class ParentBridge {
  private iframeEl: HTMLIFrameElement | null = null;
  private listeners: Map<string, Set<MessageHandler<any>>> = new Map();
  private iframeReady = false;
  private messageQueue: ParentMessage[] = [];

  constructor() {
    this.handleMessage = this.handleMessage.bind(this);
    window.addEventListener('message', this.handleMessage);
  }

  /**
   * Bind the bridge to an iframe element so we can send messages to it.
   */
  public bindIframe(iframeEl: HTMLIFrameElement): void {
    this.iframeEl = iframeEl;
  }

  /**
   * Send a message to the iframe. Queues it if iframe isn't ready.
   */
  public send(message: ParentMessage): void {
    if (!this.iframeReady || !this.iframeEl?.contentWindow) {
      this.messageQueue.push(message);
      return;
    }

    // Default to targetOrigin '*' if we don't know the exact iframe origin yet, 
    // or use the domain from src if possible. Usually '*' is acceptable for sending down to sandboxed iframe,
    // but specific is better. We'll use the origin of the iframe SRC.
    try {
      const targetOrigin = new URL(this.iframeEl.src).origin;
      this.iframeEl.contentWindow.postMessage(message, targetOrigin);
    } catch {
      // Fallback
      this.iframeEl.contentWindow.postMessage(message, '*');
    }
  }

  /**
   * Listen for messages from the iframe.
   */
  public on<T extends IframeMessage['type']>(
    type: T,
    handler: MessageHandler<T>
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.listeners.get(type)!.add(handler as any);

    // Return unbind function
    return () => {
      this.listeners.get(type)?.delete(handler);
    };
  }

  /**
   * Mark the iframe as ready and flush the message queue.
   */
  public setReady(): void {
    this.iframeReady = true;
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      if (msg) this.send(msg);
    }
  }

  private handleMessage(event: MessageEvent): void {
    // 1. Origin check
    if (!ALLOWED_ORIGINS.includes(event.origin as any)) {
      // Ignore messages from unknown origins
      return;
    }

    // 2. Format validation
    if (!isIframeMessage(event.data)) {
      return;
    }

    const message = event.data;

    // 3. Dispatch to listeners
    const handlers = this.listeners.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (err) {
          console.error(`[ParentBridge] Error in handler for ${message.type}:`, err);
        }
      });
    }
  }

  public destroy(): void {
    window.removeEventListener('message', this.handleMessage);
    this.listeners.clear();
    this.messageQueue = [];
    this.iframeEl = null;
    this.iframeReady = false;
  }
}
