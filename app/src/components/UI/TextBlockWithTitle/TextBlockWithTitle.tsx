import React from 'react';
import c from 'classnames';
import styles from './TextBlockWithTitle.module.scss';

export const TextBlockWithTitle = ({ title, text, className }: { title: string; text: string; className?: string }) => {
  return (
    <div className={c(styles.textBlockWithTitleComponent, className)}>
      <div className={styles.title}>{title}</div>
      <div className={styles.text}>{text}</div>
    </div>
  );
};
