import { Select } from 'antd';
import styles from './SectionHeader.module.scss';
import { DualfiSwitcher } from '../UI/DualfiSwitcher';
import { DualfiDropdown } from '../UI/DualfiDropdown/DualfiDropdown';

export const SectionHeader = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string; disabled: boolean }[];
}) => {
  return (
    <div className={styles.headerLeftSideBarComponent}>
      <div className={styles.switcher}>
        <DualfiSwitcher
          value={value}
          type="text"
          options={options}
          onChange={(newValue) => onChange(newValue.toString())}
        />
      </div>
      <div className={styles.dropdownWrapper}>
        <DualfiDropdown className={styles.dropdown} value={value} onChange={onChange}>
          {options.map((option, i) => (
            <Select.Option key={`dropdown-${i}`} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </DualfiDropdown>
      </div>
    </div>
  );
};
