import { LineSeriesPoint } from 'react-vis';
import * as Papa from 'papaparse';

export async function readBids(token: string): Promise<LineSeriesPoint[]> {
  const allData: LineSeriesPoint[] = [];
  let currentBid = 0;
  const response = await fetch(`./${token.toLowerCase()}_offers.csv`);
  const responseText = await response.text();
  const data = Papa.parse(responseText);
  // eslint-disable-next-line no-restricted-syntax
  for (const line of data.data) {
    const parsed = line as string[];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [instruction, bid, side, _qty, time] = parsed;
    if (instruction === 'instruction') {
      // eslint-disable-next-line no-continue
      continue;
    }

    if (instruction === 'newOrder' && side === '0') {
      if (currentBid === 0) {
        allData.push({ x: Number(time), y: Number(bid) / 1_000_000_000 });
        currentBid = Number(bid);
      }
    }

    if (instruction === 'cancel' && currentBid !== 0) {
      allData.push({ x: Number(time), y: currentBid / 1_000_000_000 });
      // @ts-ignore
      allData.push({ x: Number(time), y: null });
      currentBid = 0;
    }
  }

  return allData;
}

export async function readOffers(token: string): Promise<LineSeriesPoint[]> {
  const allData: LineSeriesPoint[] = [];
  let currentBid = 0;
  const response = await fetch(`./${token.toLowerCase()}_offers.csv`);
  const responseText = await response.text();
  const data = Papa.parse(responseText);
  // eslint-disable-next-line no-restricted-syntax
  for (const line of data.data) {
    const parsed = line as string[];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [instruction, bid, side, _qty, time] = parsed;
    if (instruction === 'instruction') {
      // eslint-disable-next-line no-continue
      continue;
    }

    if (instruction === 'newOrder') {
      if (currentBid === 0 && side === '1') {
        allData.push({ x: Number(time), y: Number(bid) / 1_000_000_000 });
        currentBid = Number(bid);
      }
    }

    if (instruction === 'cancel' && currentBid !== 0) {
      allData.push({ x: Number(time), y: currentBid / 1_000_000_000 });
      // @ts-ignore
      allData.push({ x: Number(time), y: null });
      currentBid = 0;
    }
  }

  return allData;
}

export async function readTransactions(token: string): Promise<LineSeriesPoint[][]> {
  const allBuys: LineSeriesPoint[] = [];
  const allSells: LineSeriesPoint[] = [];
  const response = await fetch(`./${token.toLowerCase()}_transactions.csv`);
  const responseText = await response.text();
  const data = Papa.parse(responseText);
  // eslint-disable-next-line no-restricted-syntax
  for (const line of data.data) {
    const parsed = line as string[];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [side, price, qty, time] = parsed;
    const timeSecs = new Date(time).getTime() / 1_000;
    if (side === 'sell') {
      allSells.push({ x: Number(timeSecs), y: Number(price) });
    }
    if (side === 'buy') {
      allBuys.push({ x: Number(timeSecs), y: Number(price) });
    }
  }

  return [allBuys, allSells];
}

export async function readRecentSummary(): Promise<string> {
  const response = await fetch(`./summary.txt`);
  const responseText = await response.text();
  return responseText;
}
