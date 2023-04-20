import { useLocalStorage } from '@solana/wallet-adapter-react';
import { FC } from 'react';
import { ModalProps } from 'antd';
import { DualfiModalOneColumn } from './UI/DualfiModal/DualfiModal';
import { InfoCard } from './InfoCard/InfoCard';

export const DisclaimerModal: FC<ModalProps> = (props) => {
  const [isDisclaimerVisible, setIsDisclaimerVisible] = useLocalStorage('show-disclaimer', true);

  return (
    <DualfiModalOneColumn
      {...props}
      visible={isDisclaimerVisible}
      onCancel={() => setIsDisclaimerVisible(false)}
      content={
        <InfoCard
          title="Warning"
          value="This page is intended for protocol monitoring only and made public in the spirit of openness"
          accept
          onAccept={() => setIsDisclaimerVisible(false)}
        />
      }
    />
  );
};
