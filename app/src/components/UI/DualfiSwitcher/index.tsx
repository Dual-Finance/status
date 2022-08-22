import { Segmented } from 'antd';
import React from 'react';
import { SegmentedProps } from 'antd/lib/segmented';
import c from 'classnames';
import styles from './DualFiSwitcher.module.scss';

export interface DualfiSwitcherProps extends SegmentedProps {
  type?: 'text' | 'icon';
}

export const DualfiSwitcher = (props: DualfiSwitcherProps) => {
  return (
    // TODO: fix ref issue
    // @ts-ignore
    <Segmented className={c(styles.dualfiSwitcherComponent, { [styles.icons]: props.type === 'icon' })} {...props} />
  );
};
