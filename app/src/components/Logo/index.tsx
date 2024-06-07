import React from 'react';
import dualFiLogo from '../../assets/header/logo.svg';
import styles from './Logo.module.scss';

export function Logo() {
  return (
    <a className={styles.logo} href="https://app.dual.finance">
      <img src={dualFiLogo} alt="DUAL Finance" />
    </a>
  );
}
