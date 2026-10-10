// Loads the Paystack Inline popup script on demand and wraps it in a promise-friendly helper.
// Docs: https://paystack.com/docs/payments/accept-payments/#popup

const PAYSTACK_SCRIPT_SRC = 'https://js.paystack.co/v1/inline.js';

interface PaystackTransaction {
  reference: string;
  status: string;
  [key: string]: unknown;
}

interface PaystackPopSetupOptions {
  key: string;
  email: string;
  amount: number; // in the smallest currency unit (pesewas for GHS)
  currency?: string;
  ref: string;
  channels?: string[];
  onClose?: () => void;
  callback?: (transaction: PaystackTransaction) => void;
}

interface PaystackPopHandler {
  openIframe: () => void;
}

interface PaystackPopGlobal {
  setup: (options: PaystackPopSetupOptions) => PaystackPopHandler;
}

declare global {
  interface Window {
    PaystackPop?: PaystackPopGlobal;
  }
}

let loadPromise: Promise<void> | null = null;

function loadPaystackScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Not in a browser'));
  if (window.PaystackPop) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = PAYSTACK_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load the Paystack payment script. Check your connection and try again.'));
    document.body.appendChild(script);
  });
  return loadPromise;
}

export async function openPaystackCheckout(options: {
  publicKey: string;
  email: string;
  amountPesewas: number;
  reference: string;
  onSuccess: (reference: string) => void;
  onClose?: () => void;
}): Promise<void> {
  await loadPaystackScript();
  if (!window.PaystackPop) {
    throw new Error('Paystack script loaded but PaystackPop is unavailable.');
  }

  const handler = window.PaystackPop.setup({
    key: options.publicKey,
    email: options.email,
    amount: options.amountPesewas,
    currency: 'GHS',
    ref: options.reference,
    channels: ['mobile_money', 'card', 'bank', 'ussd'],
    callback: (transaction) => {
      options.onSuccess(transaction.reference);
    },
    onClose: options.onClose,
  });
  handler.openIframe();
}
