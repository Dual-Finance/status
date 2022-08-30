import React, { useMemo, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ConnectionProvider, useLocalStorage, WalletProvider } from '@solana/wallet-adapter-react';
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-ant-design';
import { Layout } from './components/Layout/Layout';
import { Pools } from './pages/pools';
import { Config } from './config/config';

function App() {
  // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
  const [network, setNetwork] = useState(Config.apiUrl());
  // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
  const [autoConnect, _setAutoConnect] = useLocalStorage('autoConnect', true);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded.
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect={autoConnect}>
        <WalletModalProvider featuredWallets={9} className="dualfi-wallet-adapter-modal">
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Pools />} />
              </Routes>
            </Layout>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
