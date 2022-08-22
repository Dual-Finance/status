import { Input } from 'antd';
import c from 'classnames';
import styles from './DualfiInput.module.scss';
import { DualfiInputProps } from './types';

export const DualfiInput = (props: DualfiInputProps) => {
  const { onMaxClick, onChange, hasMaxButton = false, className, token, ...rest } = props;
  return (
    <div className={c(styles.dualfiInputComponent, className)}>
      <div className={styles.dualfiInputWrapper}>
        {token && <i className={c(styles.tokenIcon, `${token.toLowerCase() || ''}-icon`)} />}
        <div className={styles.input}>
          <Input {...rest} onChange={onChange} />
        </div>
        {hasMaxButton && (
          <div className={styles.maxButton} onClick={onMaxClick}>
            max
          </div>
        )}
      </div>
    </div>
  );
};
