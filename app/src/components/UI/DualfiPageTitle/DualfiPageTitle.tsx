import Title from 'antd/lib/typography/Title';
import React from 'react';
import styles from './DualfiPageTitle.module.scss';

export function DualfiPageTitle(props: { title: string }) {
  const { title } = props;
  return <Title className={styles.pageTitle}>{title}</Title>;
}
