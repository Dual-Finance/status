import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { Layout } from './components/Layout/Layout';
import { Pools } from './pages/pools';
import { Config } from './config/config';

function App() {
  // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
  const [network, setNetwork] = useState(Config.apiUrl());

  return (
    <ConnectionProvider endpoint={network}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Pools />} />
          </Routes>
        </Layout>
      </Router>
    </ConnectionProvider>
  );
}

export default App;
