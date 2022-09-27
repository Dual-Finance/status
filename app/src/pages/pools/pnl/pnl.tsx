/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { Connection, PublicKey } from '@solana/web3.js';
import {
  Config,
  getMarketByBaseSymbolAndKind,
  GroupConfig,
  MangoAccount,
  MangoClient,
  MangoCache,
  BookSide,
  PerpMarket,
  MangoGroup,
  PerpEventLayout,
  FillEvent,
} from '@blockworks-foundation/mango-client';
import { ColumnsType } from 'antd/lib/table';
import { prettyFormatPrice } from '../../../utils/utils';
import { DualfiTable } from '../../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';

export const PnL = (props: { network: string }) => {
  const { network } = props;
  const [priceAccounts, setPriceAccounts] = useState<string[]>([]);
  // Two Methods to Calc PnL
  // Equity_Total_PnL = Trade_Total_PnL

  // Equity_Total PnL = BVE_PnL + RM_PnL + Exercise_PnL + Treasury_PnL
  // BVE_Pnl = DIP_Value - Premium_Paid
  // RM_PnL = Mango_Equity - (Mango_Deposits - Mango_Withdrawals)
  // Exercise_PnL = Exercise_Spot_Value - Exercise_Paid
  // Treasury_PnL = Address_Value - (Address_Deposits - Address Withdrawals)

  // Trade_Total_PnL = BVE_Trades + RM_Trades + Exercise_Trades + Swap_Trades + Perp_Funding_Rates + Mango Interest
  // BVE_Trades = SumTotal((Current_Price - Premium_Price) * Qty)
  // Mango_Trades = SumTotal((Current_Price - Perp_Trade_Price)*Qty + (Current_Price - Serum_Trade_Price)*Qty)
  // Exercise_Trades = SumTotal((Current Price - Strike_Price) * Qty)
  // Swap_Trades = SumTotal((Current_Price - Swap_Trade_Price)*Qty)
  // Perp_Funding_Rates = SumTotal(Mango Account Hourly Payment)
  // Mango_Interest = SumTotal(Mango Account Hourly Interest)

  const columns: ColumnsType<number> = [
    {
      title: 'Pool Value',
      dataIndex: 'premium',
      sorter: (a, b) => a - b,
      render: (premium: number) => {
        return <>{prettyFormatPrice(premium).padStart(7, ' ')}</>;
      },
    },
    {
      title: 'Mango Value',
      dataIndex: 'premium',
      sorter: (a, b) => a - b,
      render: (premium: number) => {
        return <>{prettyFormatPrice(premium).padStart(7, ' ')}</>;
      },
    },
    {
      title: 'Premium Paid',
      dataIndex: 'premium',
      sorter: (a, b) => a - b,
      render: (premium: number) => {
        return <>{prettyFormatPrice(premium).padStart(7, ' ')}</>;
      },
    },
  ];

  const getTableRows = () => {
    return priceAccounts;
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
