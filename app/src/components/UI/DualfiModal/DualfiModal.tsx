import React from 'react';
import { Modal, ModalProps } from 'antd';
import styles from './DualfiModal.module.scss';
import { DualfiModalClose } from './DualfiModalClose';

export type DualfiModalProps = ModalProps & {
  leftColumn?: React.ReactElement;
  rightColumn?: React.ReactElement;
};

export type DualfiModalOneColumnProps = ModalProps & {
  content?: React.ReactElement;
};
export const DualfiModal = (props: DualfiModalProps) => {
  const { visible, onCancel, leftColumn, rightColumn } = props;

  return (
    <Modal
      {...props}
      centered
      className={styles.modal}
      footer={false}
      visible={visible}
      onCancel={onCancel}
      closeIcon={<DualfiModalClose />}
    >
      <div className={styles.modalWrapper}>
        <div className={styles.modalColumn}>{leftColumn}</div>
        <div className={styles.modalColumn}>{rightColumn}</div>
      </div>
    </Modal>
  );
};

export const DualfiModalOneColumn = (props: DualfiModalOneColumnProps) => {
  const { visible, onCancel, content } = props;

  return (
    <Modal
      {...props}
      centered
      className={styles.modal}
      footer={false}
      visible={visible}
      onCancel={onCancel}
      closeIcon={<DualfiModalClose />}
    >
      <div className={styles.modalWrapper}>
        <div className={styles.modalMiddleColumn}>{content}</div>
      </div>
    </Modal>
  );
};
