import c from 'classnames';
import { ColumnsType } from 'antd/lib/table';
import { Config } from '../../config/config';
import { getTokenIconClass } from '../../utils/utils';
import { DualfiTable } from '../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';
import { AccountParams, useGasAccounts } from '../../hooks/useGasAccounts';

interface GasProps {
  network: string;
}

export function Gas({ network }: GasProps) {
  const priceAccounts = useGasAccounts(network);

  const columns: ColumnsType<AccountParams> = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (_, data) => {
        return <a href={`https://explorer.solana.com/address/${data.address.toBase58()}`}>{data.name}</a>;
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      sorter: (a, b) => a.amount - b.amount,
      render: (_, data) => {
        return (
          <div className={styles.premiumCell}>
            {data.amount.toLocaleString()}
            <div className={c(styles.tokenIcon, getTokenIconClass(Config.pkToAsset(data.splMint.toBase58())))} />
          </div>
        );
      },
    },
  ];

  return (
    <DualfiTable
      className={styles.balanceTable}
      columns={columns}
      pagination={{ pageSize: 10 }}
      dataSource={priceAccounts}
      scroll={{ x: true }}
    />
  );
}
