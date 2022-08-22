import { InputProps } from 'antd';

export type DualfiInputProps = InputProps & {
  onMaxClick?: () => void;
  hasMaxButton?: boolean;
  token?: string;
};
