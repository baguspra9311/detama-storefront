/**
 * Checkout Parent Logic
 * Orchestrates the headless checkout experience on the landing page.
 * Responsibilities:
 * - Sync checkout state (cart items)
 * - Initialize and manage Checkout Iframe
 * - Handle cross-domain communication (height, success, redirects)
 */

interface CheckoutItem {
    id: string;
    variantId: string;
    quantity: number;
    name?: string;
    price?: number;
}

const CheckoutParent = (() => {
    let iframe: HTMLIFrameElement | null = null;
    let currentItems: CheckoutItem[] = [];

    const init = () => {
        console.log("[Detama] Checkout Parent Initialized");
        
        // 1. Initial State Sync
        loadState();

        // 2. Setup Message Listener
        window.addEventListener('message', handleIframeMessage);

        // 3. Auto-init iframe if the container exists
        const container = document.getElementById('detama-checkout-container');
        if (container) {
            setupIframe(container);
        }
    };

    const loadState = () => {
        try {
            const stored = localStorage.getItem('detama_cart_v1');
            if (stored) {
                currentItems = JSON.parse(stored);
            }
        } catch (e) {
            console.warn("[Detama] Failed to load cart state", e);
        }
    };

    const setupIframe = (container: HTMLElement) => {
        if (iframe) return;

        iframe = document.createElement('iframe');
        iframe.id = 'detama-checkout-iframe';
        // Base URL will be replaced by production CDN URL
        const checkoutUrl = new URL('https://cdn.detama.id/CheckoutPage');
        
        // Pass cart context via hash or params for initial load
        if (currentItems.length > 0) {
            checkoutUrl.searchParams.set('items', btoa(JSON.stringify(currentItems)));
        }

        iframe.src = checkoutUrl.toString();
        iframe.style.width = '100%';
        iframe.style.border = 'none';
        iframe.style.overflow = 'hidden';
        iframe.setAttribute('scrolling', 'no');
        
        container.appendChild(iframe);
        console.log("[Detama] Iframe injected:", checkoutUrl.toString());
    };

    const handleIframeMessage = (event: MessageEvent) => {
        const data = event.data;
        if (!data || !data.type) return;

        switch (data.type) {
            case 'checkout-height':
            case 'resize': // Legacy compatibility
                if (iframe && data.height) {
                    iframe.style.height = `${data.height}px`;
                }
                break;

            case 'checkout-success':
                console.log("[Detama] Checkout Successful:", data.orderId);
                localStorage.removeItem('detama_cart_v1');
                // Redirect to success page (configured in metadata or response)
                window.location.href = data.redirectUrl || '/success';
                break;

            case 'checkout-error':
                console.error("[Detama] Checkout Error:", data.error);
                break;
        }
    };

    // Public API for landing page scripts to update cart
    return {
        init,
        updateCart: (items: CheckoutItem[]) => {
            currentItems = items;
            localStorage.setItem('detama_cart_v1', JSON.stringify(items));
            if (iframe) {
                iframe.contentWindow?.postMessage({
                    type: 'update-cart',
                    items: currentItems
                }, '*');
            }
        }
    };
})();

// Initialize on DOM Ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CheckoutParent.init());
} else {
    CheckoutParent.init();
}

(window as any).DetamaCheckout = CheckoutParent;
export default CheckoutParent;
