import React from 'react';
import ReactDOM from 'react-dom/client';
import { SnackbarProvider } from 'notistack';
import App from './App';
import './styles/styles.scss';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as Element);
root.render(
  <SnackbarProvider>
    <App />
  </SnackbarProvider>
);
