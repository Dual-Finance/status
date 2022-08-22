/* eslint-disable @typescript-eslint/restrict-template-expressions */
import React from 'react';

import styles from './TourContentWrapper.module.scss';

export default function ContentComponent(props: any) {
  const isLastStep = props.currentStep === props.steps.length - 1;
  const isFirstStep = props.currentStep === 0;
  const { content } = props.steps[props.currentStep];
  const handleNext = () => {
    if (isLastStep) {
      props.setIsOpen(false);
    } else {
      props.setCurrentStep((s: number) => s + 1);
    }
  };
  const handlePrev = () => {
    if (isFirstStep) {
      return;
    }
    props.setCurrentStep((s: number) => s - 1);
  };
  const handleSkip = () => {
    props.setIsOpen(false);
    props.setCurrentStep(props.steps.length - 1);
    window.localStorage.setItem('isDualFiTutor', 'true');
  };

  return (
    <div className={styles.wrapper}>
      {/* Check if the step.content is a function or a string */}
      {typeof content === 'function' ? content({ ...props, someOtherStuff: 'Custom Text' }) : content}
      <div className={styles.actions}>
        <span className={styles.steps}>{`${(props.currentStep as number) + 1} / ${props.steps.length}`}</span>
        {!isFirstStep && (
          <button type="button" onClick={handlePrev} className={styles.button}>
            Prev
          </button>
        )}
        <button type="button" onClick={handleNext} className={styles.button}>
          {isLastStep ? 'Close' : 'Next'}
        </button>
        <button type="button" onClick={handleSkip} className={styles.button}>
          Skip
        </button>
      </div>
    </div>
  );
}
