import React, { useState, useEffect } from 'react';
import c from 'classnames';
import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { ColumnsType } from 'antd/lib/table';
import { parsePriceData } from '@pythnetwork/client';
import { getAssociatedTokenAddress } from '@solana/spl-token';
// @ts-ignore
import * as bs from 'black-scholes';
import { dualMarketProgramID, Config, VAULT_SPL_ACCOUNT_SEED, rfRate } from '../../config/config';
import {
  findProgramAddressWithMintAndStrikeAndExpiration,
  getMultipleAccounts,
  getMultipleTokenAccounts,
  GetProvider,
  getTokenIconClass,
  optionTokenMintPk,
  parseDipState,
  prettyFormatPrice,
} from '../../utils/utils';
import { DualfiTable } from '../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';

export const Dips = (props: { network: string }) => {
  const wallet = useWallet();
  const { network } = props;

  // eslint-disable-next-line no-unused-vars
  const [priceAccounts, setPriceAccounts] = useState<DipParams[]>([]);

  interface DipParams {
    // Just needed for react
    key: React.Key;
    // Expiration string that is human readable
    expiration: string;
    // Expiration in seconds since epoch
    expirationInt: number;
    // Strike price for the DIP
    strike: number;
    // String for "UPSIDE" or "DOWNSIDE"
    upOrDown: string;
    // Public key of this DIP Params
    pk: PublicKey;
    // Mint of the base token
    splMint: PublicKey;
    // Mint of the quote token
    usdcMint: PublicKey;
    // APY of the DIP
    apy: number;
    // Premium for paying 1 full token
    premium: number;
    // Asset price
    assetPrice: number;
    // Number of options held by the risk manager
    riskManager: number;
    // Number of tokens deposited
    totalDeposits: number;
  }

  function createDipParams(
    key: React.Key,
    expiration: string,
    expirationInt: number,
    strike: number,
    upOrDown: string,
    pk: PublicKey,
    splMint: PublicKey,
    usdcMint: PublicKey,
    apy: number,
    premium: number,
    assetPrice: number,
    riskManager: number,
    totalDeposits: number
  ) {
    return {
      key,
      expiration,
      expirationInt,
      strike,
      upOrDown,
      pk,
      splMint,
      usdcMint,
      apy,
      premium,
      assetPrice,
      riskManager,
      totalDeposits,
    };
  }

  // @ts-ignore
  useEffect(() => {
    const refreshPrices = async (localConnection: Connection) => {
      try {
        const priceInfos = await getMultipleAccounts(
          localConnection,
          [Config.pythBtcPk().toBase58(), Config.pythEthPk().toBase58(), Config.pythSolPk().toBase58()],
          'confirmed'
        );

        const freshPrices = {
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          BTC: Math.round(parsePriceData(priceInfos.array[0].data).price * 100) / 100,
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          ETH: Math.round(parsePriceData(priceInfos.array[1].data).price * 100) / 100,
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          SOL: Math.round(parsePriceData(priceInfos.array[2].data).price * 100) / 100,
        };
        return freshPrices;
      } catch (error) {
        // Do nothing. This will retry
        console.log(error);
      }
    };

    async function fetchData() {
      const [, connection] = GetProvider(wallet, network);

      const freshPrices = await refreshPrices(connection);
      if (freshPrices === undefined) {
        return;
      }
      const freshBtcPrice = freshPrices.BTC;
      const freshEthPrice = freshPrices.ETH;
      const freshSolPrice = freshPrices.SOL;

      const PRICE_MAP = {
        [Config.sobtcMintPk().toBase58()]: freshBtcPrice,
        [Config.soethMintPk().toBase58()]: freshEthPrice,
        So11111111111111111111111111111111111111112: freshSolPrice,
      };

      const programAccountsPromise = connection.getProgramAccounts(dualMarketProgramID);

      // @ts-ignore
      programAccountsPromise.then(
        // @ts-ignore
        async (data) => {
          const allPriceAccounts = [];

          const accountsToFetch = [];

          // eslint-disable-next-line no-restricted-syntax
          for (const programAccount of data) {
            try {
              if (programAccount.account.data.length !== 260) {
                // eslint-disable-next-line no-continue
                continue;
              }
              const dipState = parseDipState(programAccount.account.data);
              const { expiration, splMint } = dipState;

              // Get the option mint
              const optionMintPk = await optionTokenMintPk(dipState.strike, expiration, splMint);
              // Get the associated token addresses
              const riskManagerPk = await getAssociatedTokenAddress(
                optionMintPk,
                new PublicKey('9SgZKdeTMaNuEZnhccK2crHxi1grXRmZKQCvNSKgVrCQ')
              );
              const [vaultSplTokenAccount] = await findProgramAddressWithMintAndStrikeAndExpiration(
                VAULT_SPL_ACCOUNT_SEED,
                dipState.strike,
                expiration,
                splMint,
                Config.usdcMintPk(),
                dualMarketProgramID
              );

              accountsToFetch.push(riskManagerPk.toBase58());
              accountsToFetch.push(vaultSplTokenAccount.toBase58());
            } catch (error) {
              console.log(error);
            }
          }

          const fetchedTokenAccounts = (await getMultipleTokenAccounts(connection, accountsToFetch, 'confirmed')).array;

          // eslint-disable-next-line no-restricted-syntax
          for (const programAccount of data) {
            try {
              if (programAccount.account.data.length !== 260) {
                // eslint-disable-next-line no-continue
                continue;
              }
              const dipState = parseDipState(programAccount.account.data);

              const strike: number = dipState.strike / 1_000_000;
              const { expiration, splMint } = dipState;

              const m = new Date();
              m.setTime(expiration * 1_000);
              const dateString = m.toDateString().split(' ').slice(1).join(' ');

              const riskManagerTokenAccount = fetchedTokenAccounts.shift();
              const vaultSplTokenAccount = fetchedTokenAccounts.shift();

              const durationMs = expiration * 1_000 - Date.now();
              if (
                durationMs < 0 &&
                !(vaultSplTokenAccount !== undefined && vaultSplTokenAccount.data.parsed.info.tokenAmount.uiAmount)
              ) {
                // eslint-disable-next-line no-continue
                continue;
              }
              const fractionOfYear = durationMs / 31_536_000_000;
              const currentPrice = PRICE_MAP[splMint.toBase58()];
              const vol = Config.volMap(splMint.toBase58());
              const price = bs.blackScholes(currentPrice, strike, fractionOfYear, vol, rfRate, 'call') * 1_000_000;
              const earnedRatio = price / currentPrice;
              const apr = earnedRatio / fractionOfYear / 1_000_000;
              const apy = (1 + apr * fractionOfYear) ** (1 / fractionOfYear) - 1;

              // @ts-ignore
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              const rmAmount: number =
                riskManagerTokenAccount !== null && durationMs > 0
                  ? riskManagerTokenAccount.data.parsed.info.tokenAmount.uiAmount
                  : 0;

              // @ts-ignore
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              const totalDeposits: number =
                vaultSplTokenAccount !== null ? vaultSplTokenAccount.data.parsed.info.tokenAmount.uiAmount : 0;

              if (totalDeposits < 0.001 && durationMs < 0) {
                // eslint-disable-next-line no-continue
                continue;
              }

              // Do not display anything older than 30 days.
              if (durationMs < -1_000 * 60 * 60 * 24 * 30) {
                // eslint-disable-next-line no-continue
                continue;
              }

              allPriceAccounts.push(
                // @ts-ignore
                createDipParams(
                  `${expiration}${strike}${splMint.toBase58()}`,
                  dateString,
                  expiration,
                  strike,
                  'UPSIDE',
                  // @ts-ignore
                  programAccount.pubkey,
                  splMint,
                  Config.usdcMintPk(),
                  apy,
                  price,
                  currentPrice,
                  Math.floor(rmAmount * 1_000_000) / 1_000_000,
                  Math.floor(totalDeposits * 1_000_000) / 1_000_000
                )
              );
            } catch (error) {
              console.log(error);
            }
          }
          setPriceAccounts(allPriceAccounts);
        },
        (error: Error) => {
          console.log(error);
        }
      );
    }

    fetchData()
      .then()
      .catch((err) => console.error(err));
  }, [network, wallet]);

  const columns: ColumnsType<DipParams> = [
    {
      title: 'Expiration',
      dataIndex: 'expiration',
      sorter: (a, b) => a.expirationInt - b.expirationInt,
    },
    {
      title: 'Strike',
      dataIndex: 'strike',
      sorter: (a, b) => a.strike - b.strike,
      render: (strike: number) => {
        return <>{prettyFormatPrice(strike).padStart(7, ' ')}</>;
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      sorter: (a, b) => a.upOrDown.length - b.upOrDown.length,
      render: () => {
        return <>UPSIDE</>;
      },
    },
    {
      title: 'Risk Manager',
      dataIndex: 'riskManager',
      sorter: (a, b) => a.riskManager - b.riskManager,
      render: (_, data) => {
        return (
          <div className={styles.premiumCell}>
            {data.riskManager}
            <div className={c(styles.tokenIcon, getTokenIconClass(Config.pkToAsset(data.splMint.toBase58())))} />
          </div>
        );
      },
    },
    {
      title: 'Total Deposits',
      dataIndex: 'deposits',
      sorter: (a, b) => a.totalDeposits - b.totalDeposits,
      render: (_, data) => {
        return (
          <div className={styles.premiumCell}>
            {data.totalDeposits}
            <div className={c(styles.tokenIcon, getTokenIconClass(Config.pkToAsset(data.splMint.toBase58())))} />
          </div>
        );
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
      pagination={{ pageSize: 10 }}
      dataSource={getTableRows()}
      scroll={{ x: true }}
    />
  );
};
