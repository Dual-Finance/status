import { ModalProps } from 'antd/lib/modal';
import React from 'react';

export type DualfiModalProps = ModalProps & {
  leftColumn?: React.ReactElement;
  rightColumn?: React.ReactElement;
};

export type DualfiModalOneColumnProps = ModalProps & {
  content?: React.ReactElement;
};
