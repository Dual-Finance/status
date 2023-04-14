import { Option } from 'antd/es/mentions';
import styles from './SectionHeaderLeft.module.scss';
import { DualfiSwitcher } from '../../components/UI/DualfiSwitcher';
import { DualfiDropdown } from '../../components/UI/DualfiDropdown/DualfiDropdown';

export const SectionHeaderLeft = ({
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
          type="text"
          options={options}
          onChange={(v) => {
            onChange(String(v));
          }}
        />
      </div>
      <div className={styles.dropdown}>
        <DualfiDropdown style={{ width: '120px' }} value={value} onChange={onChange}>
          {options.map((option) => (
            <Option value={option.value}>{option.label}</Option>
          ))}
        </DualfiDropdown>
      </div>
    </div>
  );
};
