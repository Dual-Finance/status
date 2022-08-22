import React, { FC } from 'react';
import { Tooltip } from 'antd';
import { InfoCircleFilled } from '@ant-design/icons';
import c from 'classnames';
import styles from './InfoCard.module.scss';
import { getTokenIconClass } from '../../../utils/utils';
import { Button } from '../../../components/UI/Button/Button';

interface InfoCardProps {
  title: string;
  value: string;
  token?: string;
  tooltip?: string;
  accept?: boolean;
  onAccept?: () => void;
}

export const InfoCard: FC<InfoCardProps> = ({
  title,
  value,
  token,
  tooltip = '',
  accept = false,
  onAccept = () => {},
}) => {
  return (
    <div className={styles.infoCardComponent}>
      <div className={styles.title}>
        {title}
        {tooltip && (
          <Tooltip title={tooltip}>
            <InfoCircleFilled />
          </Tooltip>
        )}
      </div>
      <div className={styles.value}>
        {token && <div className={c(styles.tokenIcon, getTokenIconClass(token))} />}
        <div className={styles.content}>
          {value}
          {accept && <Button onClick={onAccept}>Accept</Button>}
        </div>
      </div>
    </div>
  );
};
