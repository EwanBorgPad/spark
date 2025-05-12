declare namespace JSX {
  interface IntrinsicElements {
    'sf-airdrop-claim': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'data-theme'?: string;
        style?: React.CSSProperties;
        name?: string;
        cluster?: string;
        'distributor-id'?: string;
        endpoint?: string;
        'token-decimals'?: string;
        'token-symbol'?: string;
        'enable-wallet-passthrough'?: string;
      },
      HTMLElement
    >;
  }
}