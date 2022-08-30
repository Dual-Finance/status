import React, { useState, useEffect } from 'react';
import c from 'classnames';
import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider } from '@project-serum/anchor';
import { ColumnsType } from 'antd/lib/table';
import { parsePriceData } from '@pythnetwork/client';
// @ts-ignore
import * as bs from 'black-scholes';
import { dualMarketProgramID, Config, VAULT_SPL_ACCOUNT_SEED } from '../../../config/config';
import {
  findProgramAddressWithMintAndStrikeAndExpiration,
  getAssociatedTokenAddress,
  getMultipleAccounts,
  getMultipleTokenAccounts,
  GetProvider,
  getTokenIconClass,
  optionTokenMintPk,
  parseDipState,
  prettyFormatPrice,
} from '../../../utils/utils';
import { DualfiTable } from '../../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';

export const Dips = (props: { network: string }) => {
  const { publicKey: walletPublicKey } = useWallet();
  const wallet = useWallet();
  const { network } = props;

  const [connection, setConnection] = useState<Connection | null>(null);
  const [provider, setProvider] = useState<AnchorProvider | null>(null);

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
    // Number of options held by the market makers
    marketMaker: number;
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
    marketMaker: number
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
      marketMaker,
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
      if (!connection) {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // eslint-disable-next-line
          const [_provider, _connection] = GetProvider(wallet, network);
        setConnection(_connection);
        return;
      }
      if (
        !provider ||
        // @ts-ignore
        (walletPublicKey !== null &&
          ((provider.wallet && !provider.wallet.publicKey) ||
            (provider.wallet &&
              provider.wallet.publicKey &&
              provider.wallet.publicKey.toBase58() !== walletPublicKey.toBase58())))
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // eslint-disable-next-line
          const [_provider, _connection] = GetProvider(wallet, network);
        setProvider(_provider);
        return;
      }

      const freshPrices = await refreshPrices(connection);
      if (freshPrices === undefined) {
        return;
      }
      const freshBtcPrice = freshPrices.BTC;
      const freshEthPrice = freshPrices.ETH;
      const freshSolPrice = freshPrices.SOL;

      const PRICE_MAP = {
        [Config.wbtcMintPk().toBase58()]: freshBtcPrice,
        [Config.wethMintPk().toBase58()]: freshEthPrice,
        So11111111111111111111111111111111111111112: freshSolPrice,
      };

      const programAccountsPromise = connection.getProgramAccounts(dualMarketProgramID);

      // @ts-ignore
      programAccountsPromise.then(
        // @ts-ignore
        async (data) => {
          const allPriceAccounts = [];
          // eslint-disable-next-line no-restricted-syntax
          for (const programAccount of data) {
            try {
              if (programAccount.account.data.length !== 260) {
                // eslint-disable-next-line no-continue
                continue;
              }
              const dipState = parseDipState(programAccount.account.data);

              const strike: number = dipState.strike / 1_000_000;
              const { expiration } = dipState;
              const { splMint } = dipState;

              const m = new Date();
              m.setTime(expiration * 1_000);
              const dateString = `${m.getUTCFullYear()}-${m.getUTCMonth() + 1}-${m.getUTCDate()}`;

              // Get the option mint
              const optionMintPk = await optionTokenMintPk(dipState.strike, expiration, splMint);
              // Get the associated token addresses
              const riskManagerPk = await getAssociatedTokenAddress(
                optionMintPk,
                new PublicKey('9SgZKdeTMaNuEZnhccK2crHxi1grXRmZKQCvNSKgVrCQ')
              );
              const mmPk = await getAssociatedTokenAddress(
                optionMintPk,
                new PublicKey('5HSNjCjRtMedAHwUVXz7cvUufzSxKAcmC7xTniXCRsqo')
              );
              const [vaultSplTokenAccount] = await findProgramAddressWithMintAndStrikeAndExpiration(
                VAULT_SPL_ACCOUNT_SEED,
                dipState.strike,
                expiration,
                splMint,
                Config.usdcMintPk(),
                dualMarketProgramID
              );

              const tokenAccounts = await getMultipleTokenAccounts(
                connection,
                [riskManagerPk.toBase58(), mmPk.toBase58(), vaultSplTokenAccount.toBase58()],
                'confirmed'
              );

              const durationMs = expiration * 1_000 - Date.now();
              if (
                durationMs < 0 &&
                !(tokenAccounts.array[2] !== undefined && tokenAccounts.array[2].data.parsed.info.tokenAmount.uiAmount)
              ) {
                // eslint-disable-next-line no-continue
                continue;
              }
              const fractionOfYear = durationMs / 31_536_000_000;
              const currentPrice = PRICE_MAP[splMint.toBase58()];
              const vol = Config.volMap(splMint.toBase58());
              const price = bs.blackScholes(currentPrice, strike, fractionOfYear, vol, 0.01, 'call') * 1_000_000;
              const earnedRatio = price / currentPrice;
              const apy = earnedRatio / fractionOfYear / 1_000_000;

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
                  // @ts-ignore
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                  tokenAccounts.array[0] !== undefined
                    ? tokenAccounts.array[0].data.parsed.info.tokenAmount.uiAmount
                    : 0,
                  // @ts-ignore
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                  tokenAccounts.array[1] !== undefined
                    ? tokenAccounts.array[1].data.parsed.info.tokenAmount.uiAmount
                    : 0
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
  }, [walletPublicKey, connection, network, provider, wallet]);

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
      title: 'Market Makers',
      dataIndex: 'marketMaker',
      sorter: (a, b) => a.marketMaker - b.marketMaker,
      render: (_, data) => {
        return (
          <div className={styles.premiumCell}>
            {data.marketMaker}
            <div className={c(styles.tokenIcon, getTokenIconClass(Config.pkToAsset(data.splMint.toBase58())))} />
          </div>
        );
      },
    },
    {
      title: 'Total Deposits',
      dataIndex: 'deposits',
      sorter: (a, b) => a.riskManager + a.marketMaker - b.riskManager - b.marketMaker,
      render: (_, data) => {
        return (
          <div className={styles.premiumCell}>
            {data.marketMaker + data.riskManager}
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
      pagination={{ pageSize: 5 }}
      dataSource={getTableRows()}
      scroll={{ x: true }}
    />
  );
};
