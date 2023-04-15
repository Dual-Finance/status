import { Select } from 'antd';
import c from 'classnames';
import styles from './DualfiDropdown.module.scss';
import { DualfiSelectProps } from './types';
import { DualfiDropdownArrow } from './DualfiDropdownArrow';

export const DualfiDropdown = (props: DualfiSelectProps) => {
  const { className, defaultValue, onChange, children } = props;
  return (
    <Select
      {...props}
      dropdownMatchSelectWidth
      className={c(styles.select, className)}
      popupClassName={styles.dropdown}
      defaultValue={defaultValue}
      onChange={onChange}
      suffixIcon={<DualfiDropdownArrow />}
    >
      {children}
    </Select>
  );
};
