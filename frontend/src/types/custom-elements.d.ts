declare namespace JSX {
  interface IntrinsicElements {
    'sf-airdrop-claim': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'data-theme'?: string;
        name?: string;
        cluster?: string;
        'distributor-id'?: string;
        endpoint?: string;
        'token-decimals'?: string;
        'token-symbol'?: string;
      },
      HTMLElement
    >;
  }
}