import Lottie, { Options } from 'react-lottie';
import styles from './PageCutoff.module.scss';
import pulseAnimationData from '../../assets/price-pulse-animation-lottie.json';

export const PageCutoff = ({ price, token }: { price: number; token: string }) => {
  const lottieOptions: Options = {
    loop: true,
    autoplay: true,
    animationData: pulseAnimationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };
  return (
    <div className={styles.pageCutoffComponent} data-tut="realtime_price">
      <div className={styles.header}>
        <div className={styles.title}>{token} Price:</div>
        <div className={styles.animation}>
          <Lottie options={lottieOptions} width={60} height={22} />
        </div>
      </div>
      <div className={styles.content}>{price > 0 ? price.toPrecision(3) : 'Loading'}</div>
    </div>
  );
};
