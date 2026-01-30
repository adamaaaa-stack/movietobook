declare global {
  interface Window {
    paypal?: {
      HostedButtons?: (opts: { hostedButtonId: string }) => {
        render: (selector: string) => Promise<unknown>;
      };
      Buttons?: (opts: {
        style?: { layout?: string; color?: string; shape?: string };
        createOrder: (data: unknown, actions: unknown) => Promise<string>;
        onApprove: (data: { orderID: string }, actions: unknown) => Promise<void>;
        onError?: (err: unknown) => void;
      }) => { render: (selector: string | HTMLElement) => Promise<unknown> };
    };
  }
}

export {};
