import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import React from "react"
import { WalletProvider } from '@/hooks/useWalletContext'

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>,
)
