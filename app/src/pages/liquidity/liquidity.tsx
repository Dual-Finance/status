import React, { Fragment, useEffect, useState } from 'react';
import { ColumnsType } from 'antd/lib/table';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { DualfiTable } from '../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';
import Chart from './chart';
import { readRecentSummary } from './helpers';

export const Liquidity = () => {
  const [summary, setSummary] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      const newSummary = await readRecentSummary();
      console.log(newSummary);
      setSummary(newSummary);
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

  const summaryStats = parseSummaryNumbers(summary);
  const summaryColumns: ColumnsType<MarketData> = [
    {
      title: 'Type',
      dataIndex: 'bidOrAsk',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
    },
    {
      title: 'Price',
      dataIndex: 'price',
    },
    {
      title: 'Notional',
      dataIndex: 'notional',
    },
  ];
  const getSummaryRows = (symbol: string, market: string) => {
    return summaryStats[symbol] ? Object.values(summaryStats[symbol].stats[market]) : [];
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
      <Chart token="BONK" title="BONK" />
      <Chart token="MNGO" title="MNGO" />
      <Chart token="SOL" title="SOL" />
      <Typography variant="h2" align="center">
        Summary
      </Typography>
      {summary &&
        summaryStats &&
        Object.entries(summaryStats).map(([symbol, symbolStats]) => {
          const { date, time } = symbolStats;
          return (
            <Box marginY={2} key={`summary-${symbol}`}>
              <Typography variant="h5">{symbol}</Typography>
              <Typography variant="subtitle2">
                {date} - {time}
              </Typography>
              {['Openbook', 'Jupiter'].map((market) => (
                <Fragment key={`summary-${symbol}-${market}`}>
                  <Typography variant="subtitle1">{market}</Typography>
                  <DualfiTable
                    columns={summaryColumns}
                    dataSource={getSummaryRows(symbol, market.toLowerCase())}
                    pagination={false}
                    scroll={{ x: true }}
                  />
                </Fragment>
              ))}
            </Box>
          );
        })}
    </>
  );
};

type MarketData = {
  amount: string;
  price: string;
  notional: string;
  bidOrAsk: string;
};

type SummaryStats = {
  [symbol: string]: {
    date: string;
    time: string;
    symbol: string;
    stats: {
      [market: string]: {
        buy: MarketData;
        sell: MarketData;
      };
    };
  };
};

const dateRegex = /(\d{1,4})-(\d{1,2})-(\d{1,2})/;
const timeRegex = /(\d{1,4}):(\d{1,2}):(\d{1,2})/;
const symbolRegex = /(?:^|(?:[.!?]\s))(\w+)/;
const numberRegex = /[+-]?([0-9]*[.])?[0-9]+/g;
const parseSummaryNumbers = (summary: string) => {
  const summaries = summary.split('\n\n').filter((s) => s !== '');
  const result: SummaryStats = {};

  summaries
    .reduce<string[]>((acc, str, i) => {
      if (i % 2 === 0) {
        return [...acc, str];
      }
      acc[acc.length - 1] = acc[acc.length - 1].concat(str);
      return acc;
    }, [])
    .forEach((summaryStr, i) => {
      const dateMatch = summaryStr.match(dateRegex);
      const date = dateMatch ? dateMatch[0] : '';

      const timeMatch = summaryStr.match(timeRegex);
      const time = timeMatch ? timeMatch[0] : '';

      const symbolMatch = summaryStr.match(symbolRegex);
      const symbol = symbolMatch ? symbolMatch[0] : i.toString();

      const numbersMatch = summaryStr.split('\n').splice(1).join('').match(numberRegex);
      let stats = {};
      if (numbersMatch) {
        const openbookNumbers = numbersMatch.slice(0, 6);
        const [obBuyAmount, obBuyPrice, obBuyNotional] = openbookNumbers;
        const [obSellAmount, obSellPrice, obSellNotional] = openbookNumbers.slice(3);

        const jupiterNumbers = numbersMatch.slice(6);
        const [jpBuyAmount, jpBuyPrice, jpBuyNotional] = jupiterNumbers;
        const [jpSellAmount, jpSellPrice, jpSellNotional] = jupiterNumbers.slice(3);

        const marketData = {
          openbook: {
            buy: { amount: obBuyAmount, price: obBuyPrice, notional: obBuyNotional, bidOrAsk: 'Buys' },
            sell: {
              amount: obSellAmount,
              price: obSellPrice,
              notional: obSellNotional,
              bidOrAsk: 'Sells',
            },
          },
          jupiter: {
            buy: { amount: jpBuyAmount, price: jpBuyPrice, notional: jpBuyNotional, bidOrAsk: 'Buys' },
            sell: { amount: jpSellAmount, price: jpSellPrice, notional: jpSellNotional, bidOrAsk: 'Sells' },
          },
        };
        stats = marketData;
      }
      result[symbol] = { date, time, symbol, stats };
    });
  return result;
};
