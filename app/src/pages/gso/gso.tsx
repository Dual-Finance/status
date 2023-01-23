/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-continue */
import React, { useState, useEffect } from 'react';
import c from 'classnames';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { getAccount, getMint } from '@solana/spl-token';
import { GSO as GSOHelper } from '@dual-finance/gso';
import { ColumnsType } from 'antd/lib/table';
import { Config, gsoId } from '../../config/config';
import { GetProvider, getTokenIconClass, parseGsoState } from '../../utils/utils';
import { DualfiTable } from '../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';

export const Gso = (props: { network: string }) => {
  const wallet = useWallet();
  const { network } = props;

  // eslint-disable-next-line no-unused-vars
  const [accounts, setAccounts] = useState<GsoParams[]>([]);

  interface GsoParams {
    key: React.Key;
    name: string;
    authority: PublicKey;
    subscriptionPeriodEnd: string;
    subscriptionPeriodEndInt: number;
    lockupPeriodEnd: string;
    lockupPeriodEndInt: number;
    baseMint: PublicKey;
    numLocked: number;
    lockupRatio: number;
  }

  function createGsoParams(
    key: React.Key,
    name: string,
    authority: PublicKey,
    subscriptionPeriodEnd: string,
    subscriptionPeriodEndInt: number,
    lockupPeriodEnd: string,
    lockupPeriodEndInt: number,
    baseMint: PublicKey,
    numLocked: number,
    lockupRatio: number
  ) {
    return {
      key,
      name,
      authority,
      subscriptionPeriodEnd,
      subscriptionPeriodEndInt,
      lockupPeriodEnd,
      lockupPeriodEndInt,
      baseMint,
      numLocked,
      lockupRatio,
    };
  }

  // @ts-ignore
  useEffect(() => {
    async function fetchData() {
      // eslint-disable-next-line
      const [_provider, connection] = GetProvider(wallet, network);

      const allAccounts = [];
      const data = await connection.getProgramAccounts(gsoId);
      const gsoHelper = new GSOHelper(network);

      // eslint-disable-next-line no-restricted-syntax
      for (const programAccount of data) {
        if (programAccount.account.data.length !== 1000) {
          // eslint-disable-next-line no-continue
          continue;
        }

        // Cannot use the sdk or idl until all on chain accounts match what is
        // in the idl.
        const state = parseGsoState(programAccount.account.data);
        const { soName, baseMint, lockupPeriodEnd, authority, subscriptionPeriodEnd, lockupRatioTokensPerMillion } =
          state;

        let numLocked = 0;
        try {
          const baseVault = await gsoHelper.baseVault(programAccount.pubkey);
          // TODO: Batch these together so we dont get 429.
          const baseVaultAccount = await getAccount(connection, baseVault);
          const mint = await getMint(connection, baseMint);
          numLocked = Number(baseVaultAccount.amount) / 10 ** mint.decimals;
        } catch (err) {
          console.log(err);
        }

        // Filter expired and empty GSO. In the future, these will be cleaned up on chain.
        if (numLocked === 0 && subscriptionPeriodEnd < Date.now() / 1_000) {
          continue;
        }

        const gsoParams = createGsoParams(
          soName,
          soName,
          authority,
          new Date(Number(subscriptionPeriodEnd) * 1_000).toLocaleDateString(),
          subscriptionPeriodEnd,
          new Date(Number(lockupPeriodEnd) * 1_000).toLocaleDateString(),
          lockupPeriodEnd,
          baseMint,
          numLocked,
          lockupRatioTokensPerMillion / 1_000_000
        );

        allAccounts.push(gsoParams);
      }
      setAccounts(allAccounts);
    }

    fetchData()
      .then()
      .catch((err) => console.error(err));
  }, [network, wallet]);

  const columns: ColumnsType<GsoParams> = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Authority',
      dataIndex: 'authority',
      render: (authority) => {
        // TODO Make copyable
        return `${authority.toBase58().substring(0, 4)}...`;
      },
    },
    {
      title: 'Subscription Period End',
      dataIndex: 'subscriptionPeriodEnd',
      sorter: (a, b) => a.subscriptionPeriodEndInt - b.subscriptionPeriodEndInt,
    },
    {
      title: 'Lockup Period End',
      dataIndex: 'lockupPeriodEnd',
      sorter: (a, b) => a.lockupPeriodEndInt - b.lockupPeriodEndInt,
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
    },
    {
      title: 'Locked',
      dataIndex: 'numLocked',
      sorter: (a, b) => a.numLocked - b.numLocked,
      render: (numLocked, data) => {
        return (
          <>
            {numLocked.toLocaleString()}
            <div className={c(styles.tokenIcon, getTokenIconClass(Config.pkToAsset(data.baseMint.toBase58())))} />
          </>
        );
      },
    },
  ];

  const getTableRows = () => {
    return accounts;
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
