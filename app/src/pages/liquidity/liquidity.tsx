import React, { useEffect, useState } from 'react';
import { ColumnsType } from 'antd/lib/table';
import { Typography } from '@mui/material';
import { DualfiTable } from '../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';
import Chart from './chart';
import { readDipSummary, readRecentSummary } from './helpers';

export const Liquidity = () => {
  const [summary, setSummary] = useState<string>('');
  const [dipSummary, setDipSummary] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      const newSummary = await readRecentSummary();
      const newDipSummary = await readDipSummary();
      setSummary(newSummary);
      setDipSummary(newDipSummary);
    }

    fetchData()
      .then()
      .catch((err) => {
        console.log(err);
      });
  }, []);

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
      <Chart token="SOL" title="SOL" />
      <Typography variant="h2" align="center">
        Summary
      </Typography>
      <Typography variant="body1">
        <pre style={{ color: 'black' }}>{summary}</pre>
      </Typography>
      <Typography variant="h2" align="center">
        DIP
      </Typography>
      <Typography variant="body1">
        <pre style={{ color: 'black' }}>{dipSummary}</pre>
      </Typography>
    </>
  );
};
