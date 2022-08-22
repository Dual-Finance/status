import React from 'react';
import c from 'classnames';
import styles from './SectionSidebarWrapper.module.scss';

export function SectionSidebarWrapper(props: {
  leftSide?: React.ReactElement;
  rightSide?: React.ReactElement;
  children?: React.ReactElement;
  isSingleColumn?: boolean;
}) {
  const { leftSide, rightSide, children, isSingleColumn } = props;
  return (
    <>
      <div className={styles.SideBarWrapper}>
        <div
          className={c(styles.leftSide, {
            [styles.fluidMobile]: isSingleColumn,
          })}
        >
          {leftSide}
        </div>
        {rightSide && <div className={styles.rightSide}>{rightSide}</div>}
      </div>
      {children}
    </>
  );
}
