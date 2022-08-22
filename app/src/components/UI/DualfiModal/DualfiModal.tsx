import React from 'react';
import { Modal } from 'antd';
import styles from './DualfiModal.module.scss';
import { DualfiModalClose } from './DualfiModalClose';
import { DualfiModalOneColumnProps, DualfiModalProps } from './types';

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
