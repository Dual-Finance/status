import React, { useState } from 'react';

import styles from './Pools.module.scss';
import { CurvedBackgroundWrapper } from '../../components/CurvedBackgroundWrapper/CurvedBackgroundWrapper';
import { SectionSidebarWrapper } from '../../components/SectionSidebarWrapper/SectionSidebarWrapper';
import { SectionHeaderLeft } from './SectionHeaderLeft/SectionHeaderLeft';
import { PageCutoff } from './PageCutoff/PageCutoff';
import { Dips } from './dips/dips';
import { Treasury } from './treasury/treasury';
import { Tests } from './tests/tests';

export const Pools = (props: { network: string }) => {
  const { network } = props;
  const tabs = [
    { label: 'DIPs', value: 'DIPs', disabled: false },
    { label: 'Treasury', value: 'Treasury', disabled: false },
    { label: 'Tests', value: 'Tests', disabled: false },
    { label: 'Services', value: 'Services', disabled: true },
  ];
  // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
  const [selectedProduct, setSelectedProduct] = useState<string>(tabs[0].label);

  const handleProductChange = (product: string) => {
    setSelectedProduct(product);
  };

  return (
    <div className={styles.poolsComponent}>
      <CurvedBackgroundWrapper curved={<PageCutoff price={0} token="DUAL" />}>
        <SectionSidebarWrapper leftSide={<SectionHeaderLeft options={tabs} onChange={handleProductChange} />}>
          <>
            {selectedProduct === 'DIPs' && <Dips network={network} />}
            {selectedProduct === 'Treasury' && <Treasury network={network} />}
            {selectedProduct === 'Tests' && <Tests />}
          </>
        </SectionSidebarWrapper>
      </CurvedBackgroundWrapper>
    </div>
  );
};
