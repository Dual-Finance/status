import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { Layout } from './components/Layout/Layout';
import { Home } from './pages';
import { Config } from './config/config';
import { DisclaimerModal } from './components/DisclaimerModal';

function App() {
  return (
    <ConnectionProvider endpoint={Config.apiUrl()}>
      <Layout>
        <DisclaimerModal />
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Router>
      </Layout>
    </ConnectionProvider>
  );
}

export default App;
