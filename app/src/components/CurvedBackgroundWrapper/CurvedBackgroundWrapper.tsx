import React from 'react';
import c from 'classnames';
import styles from './CurvedBackgroundWrapper.module.scss';

export function CurvedBackgroundWrapper(props: {
  children?: any;
  curved?: React.ReactElement;
  isCutOffHidden?: boolean;
}) {
  const { children, curved, isCutOffHidden } = props;
  return (
    <div
      className={c(styles.curvedWrapper, {
        [styles.curved]: !isCutOffHidden,
      })}
    >
      {!isCutOffHidden ? <div className={styles.curvedComponentPosition}>{curved}</div> : <div>{curved}</div>}
      {children}
    </div>
  );
}
