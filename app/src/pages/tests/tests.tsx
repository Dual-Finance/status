import React, { useEffect } from 'react';
import { ColumnsType } from 'antd/lib/table';
import { DualfiTable } from '../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';

export const Tests = () => {
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

  // @ts-ignore
  useEffect(() => {
    // https://github.com/Dual-Finance/dual-labs-dip/actions/workflows/ci-anchor_test.yml/badge.svg
  }, []);

  const columns: ColumnsType<RowParams> = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (_, data) => {
        return data.name;
      },
    },
    {
      title: '',
      dataIndex: '',
      render: (_, data) => {
        return <img src={data.url} alt="" />;
      },
    },
  ];

  const getTableRows = () => {
    return [
      createRowParams(
        'DIP Program',
        'DIP Program',
        'https://github.com/Dual-Finance/dual-labs-dip/actions/workflows/ci-anchor_test.yml/badge.svg'
      ),
      createRowParams(
        'Staking Options',
        'Staking Options Program',
        'https://github.com/Dual-Finance/staking-options/actions/workflows/ci-anchor.yml/badge.svg'
      ),
      createRowParams(
        'Staking Options',
        'Staking Options Lint',
        'https://github.com/Dual-Finance/staking-options/actions/workflows/ci-lint.yml/badge.svg'
      ),
      createRowParams(
        'Staking Options',
        'Staking Options Soteria',
        'https://github.com/Dual-Finance/staking-options/actions/workflows/ci-soteria.yml/badge.svg'
      ),
      createRowParams(
        'Website',
        'Webdriver',
        'https://github.com/Dual-Finance/status/actions/workflows/ci-webdriver.yml/badge.svg'
      ),
    ];
  };

  return (
    <DualfiTable
      className={styles.balanceTable}
      columns={columns}
      pagination={{ pageSize: 5 }}
      dataSource={getTableRows()}
      scroll={{ x: true }}
    />
  );
};
