import classNames from 'classnames';
import { getTokenIconClass } from '../../utils/utils';
import styles from './TokenIcon.module.scss';

export function TokenIcon(props: { symbol: string }) {
  return <div className={classNames(styles.tokenIcon, getTokenIconClass(props.symbol))} />;
}
