/**
 * Checkout Child (Iframe) Logic
 * Handles form state, height communication, and redirection.
 */

const initCheckoutChild = () => {
    console.log("[Detama] Checkout Child Initialized");

    // 1. Height Communication (Iframe Resizing)
    const sendHeight = () => {
        const height = document.body.offsetHeight;
        window.parent.postMessage({
            type: 'checkout-height',
            height: height
        }, '*');
    };

    // Use ResizeObserver for accurate height updates
    const observer = new ResizeObserver(() => {
        sendHeight();
    });
    observer.observe(document.body);

    // Initial height send
    window.addEventListener('load', sendHeight);

    // 2. Form Submission Handling (Example)
    // We expect the parent to listen for 'checkout-success'
    const handleSuccess = (orderId: string) => {
        window.parent.postMessage({
            type: 'checkout-success',
            orderId: orderId
        }, '*');
    };

    // Export for debugging/manual triggers
    (window as any).sendDetamaHeight = sendHeight;
    (window as any).triggerDetamaSuccess = handleSuccess;
};

initCheckoutChild();
