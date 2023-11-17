import { PublicKey } from '@solana/web3.js';
import cls from 'classnames';
import { ColumnsType } from 'antd/lib/table';
import { Config } from '../../config/config';
import { getTokenIconClass } from '../../utils/utils';
import { DualfiTable } from '../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';
import { ExpiredStakingOptionRecords, useExpiredStakingOptions } from '../../hooks/useExpiredStakingOptions';

export const Expired = (props: { network: string }) => {
  const { network } = props;
  const accounts = useExpiredStakingOptions(network);

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

const soLabelFilters = [
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

const columns: ColumnsType<ExpiredStakingOptionRecords> = [
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
    filters: soLabelFilters,
    filterMode: 'tree',
    filterSearch: true,
    onFilter: (value, record) => record.name.toLowerCase().indexOf(value.toString().toLocaleLowerCase()) >= 0,
  },
  {
    title: 'Authority',
    dataIndex: 'authority',
    render: (authority: PublicKey) => {
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
    render: (baseMint: PublicKey) => {
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
    render: (quoteMint: PublicKey) => {
      if (Config.pkToAsset(quoteMint.toBase58()) !== undefined) {
        return Config.pkToAsset(quoteMint.toBase58());
      }
      return `${quoteMint.toBase58().substring(0, 4)}...`;
    },
    filters: tokenFilters,
    onFilter: (value, record) => Config.pkToAsset(record.quoteMint.toBase58()).indexOf(value.toString()) === 0,
  },
  {
    title: 'Exercised',
    dataIndex: 'exercised',
    sorter: (a, b) => a.exercised - b.exercised,
    render: (remaining, data) => {
      return (
        <>
          {remaining.toLocaleString()}
          <div className={cls(styles.tokenIcon, getTokenIconClass(Config.pkToAsset(data.baseMint.toBase58())))} />
        </>
      );
    },
  },
  {
    title: 'Notional',
    dataIndex: 'notional',
    sorter: (a, b) => a.notional - b.notional,
    render: (outstanding, data) => {
      return (
        <>
          {outstanding.toLocaleString()}
          <div className={cls(styles.tokenIcon, getTokenIconClass(Config.pkToAsset(data.baseMint.toBase58())))} />
        </>
      );
    },
  },
  {
    title: 'Fees',
    dataIndex: 'fees',
    sorter: (a, b) => a.fees - b.fees,
    render: (outstanding, data) => {
      return (
        <>
          {outstanding.toLocaleString()}
          <div className={cls(styles.tokenIcon, getTokenIconClass(Config.pkToAsset(data.baseMint.toBase58())))} />
        </>
      );
    },
  },
];
