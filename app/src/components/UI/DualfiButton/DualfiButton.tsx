import { Button } from 'antd';
import c from 'classnames';
import { DualfiButtonProps } from './types';
import styles from './DualfiButton.module.scss';

export const DualfiButton = (props: DualfiButtonProps) => {
  const { className, isFluid, type, size, children, disabled, iconSrc } = props;
  return (
    <Button
      {...props}
      className={c(styles.dualfiButton, className, {
        [styles.fluid]: isFluid,
        [styles.primaryButton]: type === 'primary',
        [styles.secondaryButton]: type === 'default' || !type,
        [styles.regular]: size === 'middle' || !size,
        [styles.large]: size === 'large',
        [styles.disabled]: disabled,
      })}
    >
      <div className={styles.dualfiButtonInner}>
        {iconSrc && <img src={iconSrc} className={styles.iconStyle} alt="" />}

        {children}
      </div>
    </Button>
  );
};
