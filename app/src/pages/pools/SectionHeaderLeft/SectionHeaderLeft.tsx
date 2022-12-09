import { Option } from 'antd/es/mentions';
import React from 'react';
import styles from './SectionHeaderLeft.module.scss';
import { DualfiSwitcher } from '../../../components/UI/DualfiSwitcher';
import { DualfiDropdown } from '../../../components/UI/DualfiDropdown/DualfiDropdown';

export const SectionHeaderLeft = ({
  onChange,
  options,
}: {
  onChange: (value: string) => void;
  options: { label: string; value: string; disabled: boolean }[];
}) => {
  return (
    <div className={styles.headerLeftSideBarComponent}>
      <div className={styles.switcher}>
        <DualfiSwitcher
          type="text"
          options={options}
          onChange={(value) => {
            onChange(String(value));
          }}
        />
      </div>
      <div className={styles.dropdown}>
        <DualfiDropdown style={{ width: '179px' }} defaultValue="Dual Investment Pools" onChange={onChange}>
          <Option value="Dual Investment Pools">DIPs</Option>
          <Option value="Treasury">Treasury</Option>
          <Option value="Liquidity">Liquidity</Option>
          <Option value="Services">Services</Option>
          <Option value="Tests">Tests</Option>
          <Option value="Transactions">Transactions</Option>
        </DualfiDropdown>
      </div>
    </div>
  );
};
