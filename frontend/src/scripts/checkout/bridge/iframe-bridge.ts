import type { IframeMessage, ParentMessage } from '@shared/types/messages';
import { isParentMessage } from '@shared/types/messages';
import { ALLOWED_ORIGINS } from '../constants';

type MessageHandler = (message: ParentMessage) => void;

/**
 * Bridge class for managing postMessage communication from the Iframe
 * to the Parent window (Landing Page).
 */
export class IframeBridge {
  private handlers: Set<MessageHandler> = new Set();
  private parentOrigin: string | null = null;
  private isConnected = false;

  constructor() {
    this.setupListener();
  }

  /**
   * Initializes listening for messages from the parent window.
   */
  private setupListener() {
    window.addEventListener('message', (event: MessageEvent) => {
      // Security check: Validate origin
      // In a real scenario, we might want to be more permissive during dev,
      // but strict in production.
      const isValidOrigin = ALLOWED_ORIGINS.some((origin) => event.origin.startsWith(origin));

      // For debugging in local without strict origin checks if needed:
      // const isValidOrigin = true; 

      if (!isValidOrigin) {
        if (event.data?.type) {
          console.warn(`[IframeBridge] Ignored message from unauthorized origin: ${event.origin}`);
        }
        return;
      }

      // Store the parent origin so we can reply securely if it's the first message
      if (!this.parentOrigin) {
        this.parentOrigin = event.origin;
        this.isConnected = true;
      }

      const data = event.data;

      // Validate message structure
      if (isParentMessage(data)) {
        this.handlers.forEach((handler) => {
          try {
            handler(data);
          } catch (error) {
            console.error('[IframeBridge] Error in message handler:', error);
          }
        });
      }
    });
  }

  /**
   * Register a callback to handle generic messages.
   */
  public onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  /**
   * Register a type-safe callback for a specific message type.
   */
  public on<T extends ParentMessage['type']>(
    type: T,
    handler: (payload: Extract<ParentMessage, { type: T }>) => void | Promise<void>
  ): () => void {
    const wrappedHandler: MessageHandler = (message) => {
      if (message.type === type) {
        handler(message as Extract<ParentMessage, { type: T }>);
      }
    };
    this.handlers.add(wrappedHandler);
    return () => {
      this.handlers.delete(wrappedHandler);
    };
  }

  /**
   * Send a strongly-typed message to the parent window.
   */
  public send(message: IframeMessage) {
    if (!window.parent || window.parent === window) {
      console.warn('[IframeBridge] Cannot send message: not inside an iframe.');
      return;
    }

    // Try to use the stored exact origin, fallback to '*' if not yet connected
    // (Though '*' is less secure, the first message like IFRAME_READY needs it
    // if we haven't received a message from the parent yet)
    const targetOrigin = this.parentOrigin || '*';
    window.parent.postMessage(message, targetOrigin);
  }

  /**
   * Check if the bridge has successfully received a message from the parent.
   */
  public get isReady() {
    return this.isConnected;
  }
}
