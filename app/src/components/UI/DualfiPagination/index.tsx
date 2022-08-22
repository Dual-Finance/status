import { Pagination, PaginationProps } from 'antd';
import styles from './DualfiPagiantion.module.scss';

export const DualfiPagination = (props: PaginationProps) => {
  return <Pagination className={styles.dualfiPaginationComponent} {...props} />;
};
