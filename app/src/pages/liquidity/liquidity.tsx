import React from 'react';
import { ColumnsType } from 'antd/lib/table';
import { DualfiTable } from '../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';
import Chart from './chart';

export const Liquidity = () => {
  interface RowParams {
    // Just needed for react
    key: React.Key;
    // Name of the test
    name: string;
    // URL for the test badge
    url: string;
  }

  function createRowParams(key: React.Key, name: string, url: string) {
    return {
      key,
      name,
      url,
    };
  }

  const columns: ColumnsType<RowParams> = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (_, data) => {
        return data.name;
      },
    },
    {
      title: 'Url',
      dataIndex: 'url',
      render: (_, data) => {
        return <a href={data.url}>Market Share Data</a>;
      },
    },
  ];

  const getTableRows = () => {
    return [
      createRowParams(
        'Dual Liquidity',
        'Dual Liquidity (WORK IN PROGRESS)',
        'https://docs.google.com/spreadsheets/d/1bAYB00T2daM13lo73G9xswP61Q35m3oL9ViGFnQULkA/edit?usp=sharing'
      ),
    ];
  };

  return (
    <>
      <DualfiTable
        className={styles.balanceTable}
        columns={columns}
        pagination={{ pageSize: 5 }}
        dataSource={getTableRows()}
        scroll={{ x: true }}
      />
      <Chart />
    </>
  );
};
