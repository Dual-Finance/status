import { useMemo, useState } from 'react';

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
import usePrice from '../hooks/usePrice';

const tabs = [
  { label: 'DIPs', value: 'DIPs', disabled: false },
  { label: 'SO', value: 'SO', disabled: false },
  { label: 'GSO', value: 'GSO', disabled: false },
  { label: 'Treasury', value: 'Treasury', disabled: false },
  { label: 'Liquidity', value: 'Liquidity', disabled: false },
  { label: 'Tests', value: 'Tests', disabled: false },
  { label: 'Services', value: 'Services', disabled: false },
];
const networkTabs = [
  { label: 'Mainnet', value: 'mainnet', disabled: false },
  { label: 'Devnet', value: 'devnet', disabled: false },
];
export const Home = () => {
  const { price } = usePrice();
  const dualPrice = price || 0;
  const [selectedProduct, setSelectedProduct] = useState(tabs[0].label);
  const [moniker, setMoniker] = useState('mainnet');

  const network = useMemo(() => {
    Config.isDev = moniker === 'devnet';
    return Config.apiUrl();
  }, [moniker]);

  return (
    <div className={styles.poolsComponent}>
      <CurvedBackgroundWrapper curved={<PageCutoff price={dualPrice} token="DUAL" />}>
        <SectionSidebarWrapper
          leftSide={<SectionHeaderLeft value={selectedProduct} options={tabs} onChange={setSelectedProduct} />}
          rightSide={<SectionHeaderLeft value={moniker} options={networkTabs} onChange={setMoniker} />}
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
