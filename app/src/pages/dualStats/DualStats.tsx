import { useState, useEffect } from 'react';
import { ColumnsType } from 'antd/lib/table';
import { DualfiTable } from '../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';
import { prettyFormatPrice, prettyFormatNumber } from '../../utils/utils';
import usePrice from '../../hooks/usePrice';
import useHolders, { Holder } from '../../hooks/useHolders';
import useTokenMeta from '../../hooks/useTokenMeta';
import { DAO_TREASURY_ADDRESS, STAKING_OPTIONS_ADDRESSES } from '../../constants/addresses';

interface StatsParams {
  // Just needed for react
  key: React.Key;
  // Name of the field
  name: string;
  // Amount
  amount: number;
  // Asset
  asset?: string;
  // Rounding
  rounding?: number;
}

const columns: ColumnsType<StatsParams> = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: (_, data) => {
      return <div className={styles.premiumCell}>{data.name.toLocaleString()}</div>;
    },
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    render: (_, data) => {
      return (
        <div className={styles.premiumCell}>
          {data.asset ? prettyFormatPrice(data.amount, data.rounding) : prettyFormatNumber(data.amount)}
        </div>
      );
    },
  },
];

export const DualStats = () => {
  const { price } = usePrice();
  const { holders } = useHolders();
  const { tokenMeta } = useTokenMeta();
  const [data, setData] = useState<StatsParams[]>([]);

  useEffect(() => {
    const stakingOptionsHolders: Holder[] = holders?.data.filter((i) => STAKING_OPTIONS_ADDRESSES.includes(i.address));
    const stakingOptions = stakingOptionsHolders.reduce((acc, curr) => acc + curr.amount / 10 ** curr.decimals, 0);
    const daoTreasuryHolder: Holder | undefined = holders?.data.find((i) => i.address === DAO_TREASURY_ADDRESS);
    const daoTreasury = daoTreasuryHolder ? daoTreasuryHolder.amount / 10 ** daoTreasuryHolder.decimals : 0;
    const nonCirculating = stakingOptions + daoTreasury;
    const totalSupply = tokenMeta ? Number(tokenMeta.supply) / 10 ** tokenMeta.decimals : 0;
    const totalCirculating = totalSupply - nonCirculating;
    const uniqueHolders = 119; // Unclear where to get this data from even though solscan shows but not in api
    const allHolders = holders?.total;
    const daoVotingDeposits = 0; // Unclear where to get this data from
    const daoVotingMembers = 40; // TODO Need to get from https://app.realms.today/dao/dual%20dao/members
    const realPrice = price || 0;
    const marketCap = realPrice * totalCirculating;
    const daoValue = 658265; // Unclear where to get this data from
    const breakEven = daoValue / totalCirculating;

    const newData = [
      { key: 'staking_options', name: 'Staking Options', amount: stakingOptions },
      { key: 'dao_treasury', name: 'DAO Treasury', amount: daoTreasury },
      { key: 'non_circulating', name: 'Non-Circulating', amount: nonCirculating },
      { key: 'total_supply', name: 'Total Supply', amount: totalSupply },
      { key: 'total_circulating', name: 'Total Circulating', amount: totalCirculating },
      { key: 'unique_holders', name: 'Unique Holders', amount: uniqueHolders },
      { key: 'all_holders', name: 'All Holders', amount: allHolders },
      { key: 'dao_voting_deposits', name: 'DAO Voting Deposits', amount: daoVotingDeposits },
      { key: 'dao_voting_members', name: 'DAO Voting Members', amount: daoVotingMembers },
      { key: 'price', name: 'Price', amount: realPrice, asset: 'usd', rounding: 6 },
      { key: 'market_cap', name: 'Market Cap', amount: marketCap, asset: 'usd' },
      { key: 'dao_value', name: 'DAO Value', amount: daoValue, asset: 'usd' },
      { key: 'break_even', name: 'Break Even', amount: breakEven, asset: 'usd', rounding: 6 },
    ];
    setData(newData);
    return () => setData([]);
  }, [price, holders, tokenMeta]);

  const getData = () => {
    return data;
  };

  return <DualfiTable columns={columns} pagination={{ pageSize: 50 }} dataSource={getData()} scroll={{ x: true }} />;
};
