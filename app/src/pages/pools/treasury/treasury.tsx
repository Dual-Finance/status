import React, { useState, useEffect } from 'react';
import c from 'classnames';
import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider } from '@project-serum/anchor';
import { ColumnsType } from 'antd/lib/table';
import {
  dualMarketProgramID,
  PK_TO_ASSET,
  PREMIUM_USDC_SEED,
  usdcMintPk,
  wbtcMintPk,
  wethMintPk,
  wsolMintPk,
} from '../../../config/config';
import {
  findProgramAddressWithMint,
  getAssociatedTokenAddress,
  getMultipleTokenAccounts,
  GetProvider,
  getTokenIconClass,
} from '../../../utils/utils';
import { DualfiTable } from '../../../components/UI/DualfiTable/DualfiTable';
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
  }

  function createAccountParams(key: React.Key, name: string, splMint: PublicKey, amount: number) {
    return {
      key,
      name,
      splMint,
      amount,
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
      const allAccounts = [];

      const [premiumUsdc] = await findProgramAddressWithMint(PREMIUM_USDC_SEED, usdcMintPk, dualMarketProgramID);
      const testingSol = await getAssociatedTokenAddress(
        wsolMintPk,
        new PublicKey('8mWfNJi2iwZmfw1Vy4bLDPiGB58EyWYemHS6x5n6q1Y7')
      );
      const testingBtc = await getAssociatedTokenAddress(
        wbtcMintPk,
        new PublicKey('8mWfNJi2iwZmfw1Vy4bLDPiGB58EyWYemHS6x5n6q1Y7')
      );
      const testingEth = await getAssociatedTokenAddress(
        wethMintPk,
        new PublicKey('8mWfNJi2iwZmfw1Vy4bLDPiGB58EyWYemHS6x5n6q1Y7')
      );
      const testingUsdc = await getAssociatedTokenAddress(
        usdcMintPk,
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
          usdcMintPk,
          tokenAccounts.array[0] !== undefined
            ? (tokenAccounts.array[0].data.parsed.info.tokenAmount.uiAmount as number)
            : 0
        )
      );
      allAccounts.push(
        createAccountParams(
          'TESTING_SOL',
          'TESTING',
          wsolMintPk,
          tokenAccounts.array[1] !== undefined
            ? (tokenAccounts.array[1].data.parsed.info.tokenAmount.uiAmount as number)
            : 0
        )
      );
      allAccounts.push(
        createAccountParams(
          'TESTING_BTC',
          'TESTING',
          wbtcMintPk,
          tokenAccounts.array[2] !== undefined
            ? (tokenAccounts.array[2].data.parsed.info.tokenAmount.uiAmount as number)
            : 0
        )
      );
      allAccounts.push(
        createAccountParams(
          'TESTING_ETH',
          'TESTING',
          wethMintPk,
          tokenAccounts.array[3] !== undefined
            ? (tokenAccounts.array[3].data.parsed.info.tokenAmount.uiAmount as number)
            : 0
        )
      );
      allAccounts.push(
        createAccountParams(
          'TESTING_USDC',
          'TESTING',
          usdcMintPk,
          tokenAccounts.array[4] !== undefined
            ? (tokenAccounts.array[4].data.parsed.info.tokenAmount.uiAmount as number)
            : 0
        )
      );
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
      title: 'Amount',
      dataIndex: 'amount',
      sorter: (a, b) => a.amount - b.amount,
      render: (_, data) => {
        return (
          <div className={styles.premiumCell}>
            {data.amount}
            <div className={c(styles.tokenIcon, getTokenIconClass(PK_TO_ASSET[data.splMint.toBase58()]))} />
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
