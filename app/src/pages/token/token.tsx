import { ColumnsType } from 'antd/lib/table';
import { DualfiTable } from '../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';
import { prettyFormatNumberWithDecimals, dollarize } from '../../utils/utils';
import usePrice from '../../hooks/usePrice';
import useHolders from '../../hooks/useHolders';
import useTokenMeta from '../../hooks/useTokenMeta';
import { useDualStakingOptions } from '../../hooks/useDualStakingOptions';
import { Config } from '../../config/config';
import { useTreasuryInfo } from '../../hooks/useTreasuryInfo';

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
          {data.asset ? dollarize(data.amount) : prettyFormatNumberWithDecimals(data.amount, data.rounding || 0)}
        </div>
      );
    },
  },
];

export const Token = (props: { network: string }) => {
  const { price } = usePrice();
  const { holders } = useHolders(props.network);
  const { tokenMeta } = useTokenMeta(props.network);
  const treasuryInfo = useTreasuryInfo(props.network);
  const stakingOptions = useDualStakingOptions(props.network);

  const amountInStakingOptions = stakingOptions ? stakingOptions.reduce((acc, curr) => acc + curr.balance, 0) : 0;
  const daoTreasury = treasuryInfo ? treasuryInfo.balances[Config.dualMintPk().toString()] : 0;
  const nonCirculating = amountInStakingOptions + daoTreasury;
  const totalSupply = tokenMeta.supply;
  const totalCirculating = totalSupply - nonCirculating;
  const uniqueHolders = holders.data.reduce((acc, holder) => {
    acc.add(holder.owner);
    return acc;
  }, new Set<string>());
  const allHolders = holders.total;
  const realPrice = price || 0;
  const marketCap = realPrice * totalCirculating;
  const treasuryValue = treasuryInfo?.daoValue || 0;
  const breakEven = treasuryValue / totalCirculating;
  const fullyDilutedValue = realPrice * totalSupply;
  const treasuryValueExDual = treasuryValue - daoTreasury * realPrice;

  const data: StatsParams[] = [
    { key: 'staking_options', name: 'Staking Options', amount: amountInStakingOptions, rounding: 0 },
    { key: 'dao_treasury', name: 'DAO Treasury', amount: daoTreasury, rounding: 0 },
    { key: 'non_circulating', name: 'Non-Circulating', amount: nonCirculating, rounding: 0 },
    { key: 'total_supply', name: 'Total Supply', amount: totalSupply, rounding: 0 },
    { key: 'total_circulating', name: 'Total Circulating', amount: totalCirculating, rounding: 0 },
    { key: 'unique_holders', name: 'Unique Holders', amount: uniqueHolders.size },
    { key: 'all_holders', name: 'All Holders', amount: allHolders },
    // TODO: add dao voting deposits and members
    { key: 'price', name: 'Price', amount: realPrice, asset: 'usd', rounding: 6 },
    { key: 'market_cap', name: 'Market Cap', amount: marketCap, asset: 'usd' },
    { key: 'dao_value', name: 'Treasury Value', amount: treasuryValue, asset: 'usd' },
    { key: 'break_even', name: 'Break Even', amount: breakEven, asset: 'usd' },
    { key: 'fully_diluted', name: 'Fully Diluted Value', amount: fullyDilutedValue, asset: 'usd', rounding: 2 },
    {
      key: 'treasury_value_ex_dual',
      name: 'Treasury Value Ex-Dual',
      amount: treasuryValueExDual,
      asset: 'usd',
      rounding: 6,
    },
  ];

  return <DualfiTable columns={columns} pagination={{ pageSize: 50 }} dataSource={data} scroll={{ x: true }} />;
};
