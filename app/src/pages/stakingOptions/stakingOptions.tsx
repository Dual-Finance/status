/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-continue */
import React, { useState, useEffect } from 'react';
import c from 'classnames';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { StakingOptions as SOHelper } from '@dual-finance/staking-options';
import { ColumnsType } from 'antd/lib/table';
import { Address, Idl, Program } from '@project-serum/anchor';
import { getMint } from '@solana/spl-token';
import { Config, stakingOptionsProgramId } from '../../config/config';
import { GetProvider, getTokenIconClass } from '../../utils/utils';
import { DualfiTable } from '../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';
import stakingOptionsIdl from '../../config/staking_options.json';

export const StakingOptions = (props: { network: string }) => {
  const wallet = useWallet();
  const { network } = props;

  // eslint-disable-next-line no-unused-vars
  const [accounts, setAccounts] = useState<SoParams[]>([]);

  interface SoParams {
    // Just needed for react
    key: React.Key;
    name: string;
    authority: PublicKey;
    expiration: string;
    expirationInt: number;
    strike: number;
    baseMint: PublicKey;
    quoteMint: PublicKey;
    remaining: number;
    outstanding: number;
  }

  function createSoParams(
    key: React.Key,
    name: string,
    authority: PublicKey,
    expiration: string,
    expirationInt: number,
    strike: number,
    baseMint: PublicKey,
    quoteMint: PublicKey,
    remaining: number,
    outstanding: number
  ) {
    return {
      key,
      name,
      authority,
      expiration,
      expirationInt,
      strike,
      baseMint,
      quoteMint,
      remaining,
      outstanding,
    };
  }

  // @ts-ignore
  useEffect(() => {
    async function fetchData() {
      const [provider, connection] = GetProvider(wallet, network);
      const program = new Program(stakingOptionsIdl as Idl, stakingOptionsProgramId, provider);
      const stakingOptionsHelper = new SOHelper(network);

      const allAccounts = [];
      const data = await connection.getProgramAccounts(stakingOptionsProgramId);

      const stateAddresses: Address[] = [];
      // Check all possible DIP.
      // eslint-disable-next-line no-restricted-syntax
      for (const programAccount of data) {
        if (programAccount.account.data.length !== 1150) {
          // eslint-disable-next-line no-continue
          continue;
        }
        stateAddresses.push(programAccount.pubkey.toBase58());
      }
      const states = await program.account.state.fetchMultiple(stateAddresses);

      // For each, check the option mint and look into the ATA
      // eslint-disable-next-line no-restricted-syntax
      for (const state of states) {
        const {
          // @ts-ignore
          strikes,
          // @ts-ignore
          soName,
          // @ts-ignore
          baseMint,
          // @ts-ignore
          optionExpiration,
          // @ts-ignore
          quoteMint,
          // @ts-ignore
          optionsAvailable,
          // @ts-ignore
          authority,
          // @ts-ignore
          baseDecimals,
          // @ts-ignore
          quoteDecimals,
          // @ts-ignore
          lotSize,
        } = state;
        // @ts-ignore
        const soMint = await stakingOptionsHelper.soMint(strikes[0], soName, new PublicKey(baseMint));
        let outstanding = 0;
        try {
          const mint = await getMint(provider.connection, soMint);
          const outstandingLots = Number(mint.supply);
          outstanding = (outstandingLots * lotSize) / 10 ** Number(baseDecimals);
        } catch (err) {
          console.log(err);
        }

        // TODO: These are from testing and should be cleaned up.
        if (soName === 'SO') {
          continue;
        }

        const strikeQuoteAtomsPerLot = Number(strikes[0]);
        const strikeQuoteAtomsPerAtom = strikeQuoteAtomsPerLot / lotSize;
        const strikeTokensPerToken = strikeQuoteAtomsPerAtom * 10 ** (Number(baseDecimals) - Number(quoteDecimals));
        const roundedStrike =
          Math.round(strikeTokensPerToken * 10 ** Number(quoteDecimals)) / 10 ** Number(quoteDecimals);

        const available = Number(optionsAvailable) / 10 ** Number(baseDecimals);
        const roundedAvailable = Math.round(available * 10 ** Number(baseDecimals)) / 10 ** Number(baseDecimals);

        // These should be cleaned up, but do not have anything in them, so dont display.
        if (optionExpiration < Date.now() / 1_000 && roundedAvailable === 0) {
          continue;
        }

        const soParams = createSoParams(
          soName,
          soName,
          new PublicKey(authority),
          new Date(Number(optionExpiration) * 1_000).toLocaleDateString(),
          Number(optionExpiration),
          roundedStrike,
          new PublicKey(baseMint),
          new PublicKey(quoteMint),
          roundedAvailable,
          outstanding
        );
        allAccounts.push(soParams);
      }
      setAccounts(allAccounts);
    }

    fetchData()
      .then()
      .catch((err) => console.error(err));
  }, [network, wallet]);

  const columns: ColumnsType<SoParams> = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Authority',
      dataIndex: 'authority',
      render: (authority) => {
        return `${authority.toBase58().substring(0, 4)}...`;
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
      sorter: (a, b) => a.strike - b.strike,
      render: (strike) => {
        return strike;
      },
    },
    {
      title: 'Token',
      dataIndex: 'baseMint',
      render: (baseMint) => {
        // TODO: If this is a known token, just use the logo
        return `${baseMint.toBase58().substring(0, 4)}...`;
      },
    },
    {
      title: 'Remaining',
      dataIndex: 'remaining',
      sorter: (a, b) => a.remaining - b.remaining,
      render: (remaining, data) => {
        return (
          <>
            {remaining}
            <div className={c(styles.tokenIcon, getTokenIconClass(Config.pkToAsset(data.baseMint.toBase58())))} />
          </>
        );
      },
    },
    {
      title: 'Outstanding',
      dataIndex: 'outstanding',
      sorter: (a, b) => a.outstanding - b.outstanding,
      render: (outstanding, data) => {
        return (
          <>
            {outstanding}
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