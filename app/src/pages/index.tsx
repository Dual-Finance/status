import { useState } from 'react';

import styles from './Pools.module.scss';
import { CurvedBackgroundWrapper } from '../components/CurvedBackgroundWrapper/CurvedBackgroundWrapper';
import { SectionSidebarWrapper } from '../components/SectionSidebarWrapper/SectionSidebarWrapper';
import { SectionHeaderLeft } from './SectionHeaderLeft/SectionHeaderLeft';
import { PageCutoff } from './PageCutoff/PageCutoff';
import { Dips } from './dips/dips';
import { Treasury } from './treasury/treasury';
import { Liquidity } from './liquidity/liquidity';
import { Tests } from './tests/tests';
import { Services } from './services/services';
import { Config } from '../config/config';
import { StakingOptions } from './stakingOptions/stakingOptions';
import { Gso } from './gso/gso';

export const Pools = () => {
  const tabs = [
    { label: 'DIPs', value: 'DIPs', disabled: false },
    { label: 'SO', value: 'SO', disabled: false },
    { label: 'GSO', value: 'GSO', disabled: false },
    { label: 'Treasury', value: 'Treasury', disabled: false },
    { label: 'Liquidity', value: 'Liquidity', disabled: false },
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
      setNetwork(Config.apiUrl());
    } else {
      Config.isDev = false;
      setNetwork(Config.apiUrl());
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
            {selectedProduct === 'SO' && <StakingOptions network={network} />}
            {selectedProduct === 'GSO' && <Gso network={network} />}
            {selectedProduct === 'Treasury' && <Treasury network={network} />}
            {selectedProduct === 'Liquidity' && <Liquidity />}
            {selectedProduct === 'Tests' && <Tests />}
            {selectedProduct === 'Services' && <Services />}
          </>
        </SectionSidebarWrapper>
      </CurvedBackgroundWrapper>
    </div>
  );
};
