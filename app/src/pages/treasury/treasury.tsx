import React, { useState, useEffect } from 'react';
import c from 'classnames';
import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider } from '@project-serum/anchor';
import { ColumnsType } from 'antd/lib/table';
import { Config as MangoConfig, GroupConfig, MangoCache, MangoClient } from '@blockworks-foundation/mango-client';
import { dualMarketProgramID, PREMIUM_USDC_SEED, Config } from '../../config/config';
import configFile from './ids.json';
import {
  findProgramAddressWithMint,
  getAssociatedTokenAddress,
  getMultipleTokenAccounts,
  GetProvider,
  getTokenIconClass,
} from '../../utils/utils';
import { DualfiTable } from '../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';

export const Treasury = (props: { network: string }) => {
  const { publicKey: walletPublicKey } = useWallet();
  const wallet = useWallet();
  const { network } = props;

  const [connection, setConnection] = useState<Connection | null>(null);
  const [provider, setProvider] = useState<AnchorProvider | null>(null);

  // eslint-disable-next-line no-unused-vars
  const [priceAccounts, setPriceAccounts] = useState<AccountParams[]>([]);

  interface AccountParams {
    // Just needed for react
    key: React.Key;
    // Name of the account
    name: string;
    // Expiration in seconds since epoch
    splMint: PublicKey;
    // Number of tokens. Full tokens
    amount: number;
    // Address of the account
    address: PublicKey;
  }

  function createAccountParams(key: React.Key, name: string, splMint: PublicKey, amount: number, address: PublicKey) {
    return {
      key,
      name,
      splMint,
      amount,
      address,
    };
  }

  // @ts-ignore
  useEffect(() => {
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
      if (provider.connection.rpcEndpoint !== network) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // eslint-disable-next-line
        const [_provider, _connection] = GetProvider(wallet, network);
        setProvider(_provider);
        setConnection(_connection);
      }
      const allAccounts = [];

      const [premiumUsdc] = await findProgramAddressWithMint(
        PREMIUM_USDC_SEED,
        Config.usdcMintPk(),
        dualMarketProgramID
      );
      const testingSol = await getAssociatedTokenAddress(
        Config.wsolMintPk(),
        new PublicKey('8mWfNJi2iwZmfw1Vy4bLDPiGB58EyWYemHS6x5n6q1Y7')
      );
      const testingBtc = await getAssociatedTokenAddress(
        Config.sobtcMintPk(),
        new PublicKey('8mWfNJi2iwZmfw1Vy4bLDPiGB58EyWYemHS6x5n6q1Y7')
      );
      const testingEth = await getAssociatedTokenAddress(
        Config.soethMintPk(),
        new PublicKey('8mWfNJi2iwZmfw1Vy4bLDPiGB58EyWYemHS6x5n6q1Y7')
      );
      const testingUsdc = await getAssociatedTokenAddress(
        Config.usdcMintPk(),
        new PublicKey('8mWfNJi2iwZmfw1Vy4bLDPiGB58EyWYemHS6x5n6q1Y7')
      );

      const tokenAccounts = await getMultipleTokenAccounts(
        connection,
        [
          premiumUsdc.toBase58(),
          testingSol.toBase58(),
          testingBtc.toBase58(),
          testingEth.toBase58(),
          testingUsdc.toBase58(),
        ],
        'confirmed'
      );

      allAccounts.push(
        createAccountParams(
          'PREMIUM',
          'PREMIUM',
          Config.usdcMintPk(),
          tokenAccounts.array[0] !== undefined
            ? (tokenAccounts.array[0].data.parsed.info.tokenAmount.uiAmount as number)
            : 0,
          premiumUsdc
        )
      );
      allAccounts.push(
        createAccountParams(
          'TESTING_SOL',
          'TESTING',
          Config.wsolMintPk(),
          tokenAccounts.array[1] !== undefined
            ? (tokenAccounts.array[1].data.parsed.info.tokenAmount.uiAmount as number)
            : 0,
          testingSol
        )
      );
      allAccounts.push(
        createAccountParams(
          'TESTING_BTC',
          'TESTING',
          Config.sobtcMintPk(),
          tokenAccounts.array[2] !== undefined
            ? (tokenAccounts.array[2].data.parsed.info.tokenAmount.uiAmount as number)
            : 0,
          testingBtc
        )
      );
      allAccounts.push(
        createAccountParams(
          'TESTING_ETH',
          'TESTING',
          Config.soethMintPk(),
          tokenAccounts.array[3] !== undefined
            ? (tokenAccounts.array[3].data.parsed.info.tokenAmount.uiAmount as number)
            : 0,
          testingEth
        )
      );
      allAccounts.push(
        createAccountParams(
          'TESTING_USDC',
          'TESTING',
          Config.usdcMintPk(),
          tokenAccounts.array[4] !== undefined
            ? (tokenAccounts.array[4].data.parsed.info.tokenAmount.uiAmount as number)
            : 0,
          testingUsdc
        )
      );

      const config = new MangoConfig(configFile);
      const groupConfig = config.getGroupWithName(Config.isDev ? 'devnet.2' : 'mainnet.1') as GroupConfig;
      const mangoClient = new MangoClient(connection, groupConfig.mangoProgramId);
      const mangoGroup = await mangoClient.getMangoGroup(groupConfig.publicKey);
      const [mangoCache]: [MangoCache] = await Promise.all([mangoGroup.loadCache(connection)]);
      const mangoAccountPk = new PublicKey('9AuFG7jBEpNM83DkxV6yadhqGnyna6GL9AaYH1CSnQfX');
      const mangoAccount = await mangoClient.getMangoAccount(mangoAccountPk, mangoGroup.dexProgramId);
      const mangoHealth = mangoAccount.getHealth(mangoGroup, mangoCache, 'Maint').toNumber();
      const readableMangoHealth = Math.floor(mangoHealth) / 1_000_000;
      // TODO: Get a mango logo so it is not confused with actual USDC
      allAccounts.push(createAccountParams('MANGO', 'MANGO', Config.usdcMintPk(), readableMangoHealth, mangoAccountPk));
      setPriceAccounts(allAccounts);
    }

    fetchData()
      .then()
      .catch((err) => console.error(err));
  }, [walletPublicKey, connection, network, provider, wallet]);

  const columns: ColumnsType<AccountParams> = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (_, data) => {
        return data.name;
      },
    },
    {
      title: 'Address',
      dataIndex: 'address',
      render: (_, data) => {
        return data.address.toBase58();
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      sorter: (a, b) => a.amount - b.amount,
      render: (_, data) => {
        return (
          <div className={styles.premiumCell}>
            {data.amount}
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
