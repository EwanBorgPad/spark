import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId="cmasdjed900usji0md76gjyna"
            config={{
                "appearance": {
                    "accentColor": "#6A6FF5",
                    "theme": "#222224",
                    "showWalletLoginFirst": false,
                    "logo": "https://auth.privy.io/logos/privy-logo-dark.png",
                    "walletChainType": "solana-only",
                    "walletList": [
                        "phantom",
                        "solflare", 
                        "backpack",
                        "okx_wallet"
                    ]
                },
                "loginMethods": [
                    "email",
                    "twitter",
                    "apple",
                    "google",
                    "wallet"
                ],
                "fundingMethodConfig": {
                    "moonpay": {
                        "useSandbox": true
                    }
                },
                "embeddedWallets": {
                    "requireUserPasswordOnCreate": false,
                    "showWalletUIs": true,
                    "ethereum": {
                        "createOnLogin": "off"
                    },
                    "solana": {
                        "createOnLogin": "users-without-wallets"
                    }
                },
                "mfa": {
                    "noPromptOnMfaRequired": false
                },
                "externalWallets": {
                    "solana": {
                        "connectors": {
                            "onMount": () => {},
                            "onUnmount": () => {},
                            "get": () => []
                        }
                    }
                }
            }}>
            {children}
        </PrivyProvider>
    );
}

