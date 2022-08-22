import { Table, TableProps } from 'antd';
import c from 'classnames';
import styles from './SummaryTable.module.scss';

export const SummaryTable = (props: TableProps<any>) => {
  const { className, ...restProps } = props;

  return <Table {...restProps} pagination={false} className={c(styles.table, className || '')} />;
};
