import { Table, TableProps } from 'antd';
import c from 'classnames';
import styles from './DualfiTable.module.scss';

export const DualfiTable = (props: TableProps<any>) => {
  const { className, ...restProps } = props;

  return <Table {...restProps} className={c(styles.dualfiTable, className || '')} />;
};
