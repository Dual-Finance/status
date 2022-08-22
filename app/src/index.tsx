import React from 'react';
import ReactDOM from 'react-dom/client';
import { SnackbarProvider } from 'notistack';
import { TourProvider } from '@reactour/tour';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import App from './App';
import TourContentWrapper from './components/TourContentWrapper/TourContentWrapper';
import './styles/styles.scss';
import './index.css';
import { APP_TOURS } from './constants/tours';
// @ts-ignore

const disableBody = (target: Element | null) => target && disableBodyScroll(target);
const enableBody = (target: Element | null) => target && enableBodyScroll(target);

const root = ReactDOM.createRoot(document.getElementById('root') as Element);
root.render(
  <SnackbarProvider>
    <TourProvider
      steps={APP_TOURS}
      afterOpen={disableBody}
      beforeClose={enableBody}
      ContentComponent={TourContentWrapper}
    >
      <App />
    </TourProvider>
  </SnackbarProvider>
);
