/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import c from 'classnames';
import { ColumnsType } from 'antd/lib/table';
import { Config } from '../../config/config';
import { getTokenIconClass } from '../../utils/utils';
import { DualfiTable } from '../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';
import { SoParams, useStakingOptions } from '../../hooks/useStakingOptions';

export const StakingOptions = (props: { network: string }) => {
  const { network } = props;
  const accounts = useStakingOptions(network);

  return (
    <DualfiTable
      className={styles.balanceTable}
      columns={columns}
      pagination={{ pageSize: 10 }}
      dataSource={accounts}
      scroll={{ x: true }}
    />
  );
};

const soFilters = [
  {
    text: 'CSA',
    value: 'csa',
  },
  {
    text: 'Loyalty',
    value: 'loyalty',
  },
  {
    text: 'Partner',
    value: 'partner',
  },
  {
    text: 'Test',
    value: 'test',
  },
  {
    text: 'MM',
    value: 'mm',
    children: [
      {
        text: 'Bonus',
        value: 'bonus',
      },
      {
        text: 'Integration',
        value: 'integration',
      },
    ],
  },
];

const tokenFilters = [
  {
    text: 'BONK',
    value: 'BONK',
  },
  {
    text: 'DUAL',
    value: 'DUAL',
  },
  {
    text: 'MNGO',
    value: 'MNGO',
  },
  {
    text: 'USDC',
    value: 'USDC',
  },
];

const columns: ColumnsType<SoParams> = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: (name, record) => {
      return (
        <a href={Config.explorerUrl(record.soMint.toBase58())} target="_blank" rel="noreferrer">
          {name}
        </a>
      );
    },
    sorter: (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    defaultSortOrder: 'ascend',
    filters: soFilters,
    filterMode: 'tree',
    filterSearch: true,
    onFilter: (value, record) => record.name.toLowerCase().indexOf(value.toString().toLocaleLowerCase()) >= 0,
  },
  {
    title: 'Authority',
    dataIndex: 'authority',
    render: (authority) => {
      // TODO Make copyable
      return (
        <a href={Config.explorerUrl(authority.toBase58())} target="_blank" rel="noreferrer">
          {`${authority.toBase58().substring(0, 4)}...`}
        </a>
      );
    },
  },
  {
    title: 'Expiration',
    dataIndex: 'expiration',
    sorter: (a, b) => a.expirationInt - b.expirationInt,
  },
  {
    title: 'Strike',
    dataIndex: 'strike',
    render: (strike) => {
      return strike;
    },
  },
  {
    title: 'Base',
    dataIndex: 'baseMint',
    render: (baseMint) => {
      if (Config.pkToAsset(baseMint.toBase58()) !== undefined) {
        return Config.pkToAsset(baseMint.toBase58());
      }
      return `${baseMint.toBase58().substring(0, 4)}...`;
    },
    filters: tokenFilters,
    onFilter: (value, record) => Config.pkToAsset(record.baseMint.toBase58()).indexOf(value.toString()) === 0,
  },
  {
    title: 'Quote',
    dataIndex: 'quoteMint',
    render: (quoteMint) => {
      if (Config.pkToAsset(quoteMint.toBase58()) !== undefined) {
        return Config.pkToAsset(quoteMint.toBase58());
      }
      return `${quoteMint.toBase58().substring(0, 4)}...`;
    },
    filters: tokenFilters,
    onFilter: (value, record) => Config.pkToAsset(record.quoteMint.toBase58()).indexOf(value.toString()) === 0,
  },
  {
    title: 'Remaining',
    dataIndex: 'remaining',
    sorter: (a, b) => a.remaining - b.remaining,
    render: (remaining, data) => {
      return (
        <>
          {remaining.toLocaleString()}
          <div className={c(styles.tokenIcon, getTokenIconClass(Config.pkToAsset(data.baseMint.toBase58())))} />
        </>
      );
    },
  },
  {
    title: 'Outstanding',
    dataIndex: 'outstanding',
    sorter: (a, b) => a.outstanding - b.outstanding,
    render: (outstanding, data) => {
      return (
        <>
          {outstanding.toLocaleString()}
          <div className={c(styles.tokenIcon, getTokenIconClass(Config.pkToAsset(data.baseMint.toBase58())))} />
        </>
      );
    },
  },
  {
    title: 'Max Fees',
    dataIndex: 'maxFees',
    sorter: (a, b) => a.maxFees - b.maxFees,
    render: (maxFees, data) => {
      return (
        <>
          {maxFees.toLocaleString()}
          <div className={c(styles.tokenIcon, getTokenIconClass(Config.pkToAsset(data.quoteMint.toBase58())))} />
        </>
      );
    },
  },
];
