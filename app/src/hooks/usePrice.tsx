import { useEffect, useState } from 'react';
import { getCoingeckoDualPrice } from '../utils/utils';

export default function usePrice2() {
  const [price, setPrice] = useState<number>();

  useEffect(() => {
    async function fetchData() {
      const geckoPrice = await getCoingeckoDualPrice();
      return geckoPrice;
    }
    fetchData()
      .then((data) => {
        if (data) {
          setPrice(data);
        }
      })
      .catch(console.error);
    const interval = setInterval(() => {
      fetchData()
        .then((data) => {
          if (data) {
            setPrice(data);
          }
        })
        .catch(console.error);
    }, 30 * 1_000);
    return () => clearInterval(interval);
  }, []);

  return {
    setPrice,
    price,
  };
}
