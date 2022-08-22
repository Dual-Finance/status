import React, { FC } from 'react';
import c from 'classnames';
import styles from './Button.module.scss';

type ButtonProps = {
  onClick?: (e: any) => void;
  type?: 'primary' | 'secondary';
  size?: 'regular' | 'large';
  link?: string;
  style?: any;
  children: React.ReactNode;
  className?: string;
  dataTut?: string;
};

export const Button: FC<ButtonProps> = ({ onClick, children, style, className, type, link, size, dataTut }) => {
  const onClickWrapper = (e: any) => {
    if (link) {
      // @ts-ignore
      window.open(link, '_blank').focus();
    }

    if (typeof onClick === 'function') {
      onClick(e);
    }
  };
  return (
    <button
      onClick={onClickWrapper}
      type="button"
      className={c(styles.button, className, {
        [styles.primary]: !type || type === 'primary',
        [styles.secondary]: type === 'secondary',
        [styles.regular]: !size || size === 'regular',
        [styles.large]: size === 'large',
      })}
      style={style}
      data-tut={dataTut}
    >
      {children}
    </button>
  );
};
