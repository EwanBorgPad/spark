declare global {
    interface Window {
      Streamflow?: {
        widgets: {
          injectWalletContext: (attachToElementInstance: HTMLElement, walletContext: unknown) => void;
        };
      };
    }
  }