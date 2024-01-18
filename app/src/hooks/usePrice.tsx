import { useEffect, useState } from 'react';
import { Config } from '../config/config';
import { fetchSingleBirdeyePrice, getCoingeckoDualPrice } from '../utils/utils';

export default function usePrice() {
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

export function useBirdeyePrice() {
  const [price, setPrice] = useState<number | null>();

  useEffect(() => {
    async function fetchData() {
      const birdeyePrice = await fetchSingleBirdeyePrice(Config.dualMintPk().toString());
      return birdeyePrice;
    }
    fetchData()
      .then((data) => {
        if (data) {
          setPrice(data.value);
        }
      })
      .catch(console.error);
    const interval = setInterval(() => {
      fetchData()
        .then((data) => {
          if (data) {
            setPrice(data.value);
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
