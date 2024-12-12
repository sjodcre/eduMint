import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import ArConnect from "@arweave-wallet-kit/arconnect-strategy"
import { registerSW } from "virtual:pwa-register";
import { ScreenProvider } from "./context/ScreenContext";
import { ArweaveWalletKit } from "@arweave-wallet-kit/react";
import othent from "@arweave-wallet-kit/othent-strategy";
import ArweaveWebWalletStrategy from "@arweave-wallet-kit/webwallet-strategy";
import { ArweaveProvider } from "./context/ProfileContext";
import { BrowserRouter } from "react-router-dom";

registerSW();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScreenProvider>
        <ArweaveWalletKit
          config={{
            permissions: [
              "ACCESS_ADDRESS",
              "ACCESS_PUBLIC_KEY",
              "SIGN_TRANSACTION",
              "DISPATCH",
            ],
            ensurePermissions: true,
            strategies: [new ArConnect(),new ArweaveWebWalletStrategy(), new othent()],
          }}
          theme={{
            displayTheme: "dark",
          }}
        >
          <ArweaveProvider>
            <App />
          </ArweaveProvider>
        </ArweaveWalletKit>
      </ScreenProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
