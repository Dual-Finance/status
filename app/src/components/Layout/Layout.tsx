import React, { FC } from 'react';
import { Header } from '../Header';
import styles from './Layout.module.scss';

export const Layout: FC<any> = ({ children }) => {
  return (
    <div className={styles.defaultLayout}>
      <Header />
      <div className={styles.contentWrapper}>{children}</div>
    </div>
  );
};
