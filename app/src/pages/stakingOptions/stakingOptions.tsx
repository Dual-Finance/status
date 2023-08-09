/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
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
    strike: string;
    soMint: PublicKey;
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
    strike: string,
    soMint: PublicKey,
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
      soMint,
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
          lotSize,
        } = state;

        for (const strike of strikes) {
          // @ts-ignore
          const soMint = await stakingOptionsHelper.soMint(strike, soName, new PublicKey(baseMint));
          const baseDecimals = (await getMint(connection, baseMint)).decimals;
          const quoteDecimals = (await getMint(connection, quoteMint)).decimals;
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
          const strikeQuoteAtomsPerLot = Number(strike);
          const strikeQuoteAtomsPerAtom = strikeQuoteAtomsPerLot / lotSize;
          const strikeTokensPerToken = strikeQuoteAtomsPerAtom * 10 ** (Number(baseDecimals) - Number(quoteDecimals));
          let roundedStrike = '';
          if (Number(strikeTokensPerToken.toString().split('-')[1]) > 0) {
            roundedStrike = strikeTokensPerToken.toFixed(Number(strikeTokensPerToken.toString().split('-')[1]));
          } else {
            roundedStrike = strikeTokensPerToken.toPrecision(3);
          }
          const available = Number(optionsAvailable) / 10 ** Number(baseDecimals);
          const roundedAvailable = Math.round(available * 10 ** Number(baseDecimals)) / 10 ** Number(baseDecimals);

          // These should be cleaned up, but do not have anything in them, so dont display.
          if (optionExpiration < Date.now() / 1_000 && roundedAvailable === 0) {
            continue;
          }

          const soParams = createSoParams(
            `${soName}-${soMint.toString()}`,
            soName,
            new PublicKey(authority),
            new Date(Number(optionExpiration) * 1_000).toDateString().split(' ').slice(1).join(' '),
            Number(optionExpiration),
            roundedStrike,
            soMint,
            new PublicKey(baseMint),
            new PublicKey(quoteMint),
            roundedAvailable,
            outstanding
          );
          allAccounts.push(soParams);
        }
      }
      setAccounts(allAccounts);
    }

    fetchData()
      .then()
      .catch((err) => console.error(err));
  }, [network, wallet]);

  const soFilters: Array<any> = [
    {
      text: 'CSA',
      value: 'csa',
    },
    {
      text: 'Loyalty',
      value: 'loyalty',
    },
    {
      text: 'Partner',
      value: 'partner',
    },
    {
      text: 'Test',
      value: 'test',
    },
    {
      text: 'MM',
      value: 'mm',
      children: [
        {
          text: 'Bonus',
          value: 'bonus',
        },
        {
          text: 'Integration',
          value: 'integration',
        },
      ],
    },
  ];

  const tokenFilters: Array<any> = [
    {
      text: 'BONK',
      value: 'BONK',
    },
    {
      text: 'DUAL',
      value: 'DUAL',
    },
    {
      text: 'MNGO',
      value: 'MNGO',
    },
    {
      text: 'USDC',
      value: 'USDC',
    },
  ];

  const columns: ColumnsType<SoParams> = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (name, record) => {
        return (
          <a href={Config.explorerUrl(record.soMint.toBase58())} target="_blank" rel="noreferrer">
            {name}
          </a>
        );
      },
      sorter: (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      defaultSortOrder: 'ascend',
      filters: soFilters,
      filterMode: 'tree',
      filterSearch: true,
      onFilter: (value, record) => record.name.toLowerCase().indexOf(value.toString().toLocaleLowerCase()) >= 0,
    },
    {
      title: 'Authority',
      dataIndex: 'authority',
      render: (authority) => {
        // TODO Make copyable
        return (
          <a href={Config.explorerUrl(authority.toBase58())} target="_blank" rel="noreferrer">
            {`${authority.toBase58().substring(0, 4)}...`}
          </a>
        );
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
      render: (strike) => {
        return strike;
      },
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
      filters: tokenFilters,
      onFilter: (value, record) => Config.pkToAsset(record.baseMint.toBase58()).indexOf(value.toString()) === 0,
    },
    {
      title: 'Quote',
      dataIndex: 'quoteMint',
      render: (quoteMint) => {
        if (Config.pkToAsset(quoteMint.toBase58()) !== undefined) {
          return Config.pkToAsset(quoteMint.toBase58());
        }
        return `${quoteMint.toBase58().substring(0, 4)}...`;
      },
      filters: tokenFilters,
      onFilter: (value, record) => Config.pkToAsset(record.quoteMint.toBase58()).indexOf(value.toString()) === 0,
    },
    {
      title: 'Remaining',
      dataIndex: 'remaining',
      sorter: (a, b) => a.remaining - b.remaining,
      render: (remaining, data) => {
        return (
          <>
            {remaining.toLocaleString()}
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
            {outstanding.toLocaleString()}
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
