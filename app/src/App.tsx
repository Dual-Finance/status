import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { Layout } from './components/Layout/Layout';
import { Home } from './pages';
import { Config } from './config/config';

function App() {
  return (
    <ConnectionProvider endpoint={Config.apiUrl()}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Layout>
      </Router>
    </ConnectionProvider>
  );
}

export default App;
