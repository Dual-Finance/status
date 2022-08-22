import React, { FC } from 'react';
import { Logo } from '../Logo';
import styles from './Header.module.scss';

export const Header: FC<any> = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.items}>
          <div className={styles.dualFiLogo}>
            <Logo />
          </div>
        </div>
      </div>
    </header>
  );
};
