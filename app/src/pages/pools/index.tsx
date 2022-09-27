import React, { useState } from 'react';

import styles from './Pools.module.scss';
import { CurvedBackgroundWrapper } from '../../components/CurvedBackgroundWrapper/CurvedBackgroundWrapper';
import { SectionSidebarWrapper } from '../../components/SectionSidebarWrapper/SectionSidebarWrapper';
import { SectionHeaderLeft } from './SectionHeaderLeft/SectionHeaderLeft';
import { PageCutoff } from './PageCutoff/PageCutoff';
import { Dips } from './dips/dips';
import { Treasury } from './treasury/treasury';
import { PnL } from './pnl/pnl';
import { Tests } from './tests/tests';
import { Services } from './services/services';
import { Config } from '../../config/config';

export const Pools = () => {
  const tabs = [
    { label: 'DIPs', value: 'DIPs', disabled: false },
    { label: 'Treasury', value: 'Treasury', disabled: false },
    { label: 'PnL', value: 'PnL', disabled: false },
    { label: 'Tests', value: 'Tests', disabled: false },
    { label: 'Services', value: 'Services', disabled: false },
  ];
  // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
  const [selectedProduct, setSelectedProduct] = useState<string>(tabs[0].label);

  const handleProductChange = (product: string) => {
    setSelectedProduct(product);
  };

  const [network, setNetwork] = useState(Config.apiUrl());
  const networkTabs = [
    { label: 'Mainnet', value: 'mainnet', disabled: false },
    { label: 'Devnet', value: 'devnet', disabled: false },
  ];
  const handleNetworkChange = (newNetwork: string) => {
    if (newNetwork === 'devnet') {
      Config.isDev = true;
      setNetwork('https://dual-rpc.com/devnet');
    } else {
      Config.isDev = false;
      setNetwork('https://dual-rpc.com/mainnet');
    }
  };

  return (
    <div className={styles.poolsComponent}>
      <CurvedBackgroundWrapper curved={<PageCutoff price={0} token="DUAL" />}>
        <SectionSidebarWrapper
          leftSide={<SectionHeaderLeft options={tabs} onChange={handleProductChange} />}
          rightSide={<SectionHeaderLeft options={networkTabs} onChange={handleNetworkChange} />}
        >
          <>
            {selectedProduct === 'DIPs' && <Dips network={network} />}
            {selectedProduct === 'Treasury' && <Treasury network={network} />}
            {selectedProduct === 'PnL' && <PnL network={network} />}
            {selectedProduct === 'Tests' && <Tests />}
            {selectedProduct === 'Services' && <Services />}
          </>
        </SectionSidebarWrapper>
      </CurvedBackgroundWrapper>
    </div>
  );
};
