import 'react-vis/dist/style.css';
import {
  XYPlot,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
  LineMarkSeriesPoint,
  MarkSeries,
  LineSeries,
  LineSeriesPoint,
} from 'react-vis';
import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import { readBids, readOffers, readTransactions } from './helpers';
import { Legend } from './legend';

export default function Chart(props: { token: string; title?: string }) {
  const { token } = props;
  const [bids, setBids] = useState<LineMarkSeriesPoint[]>([]);
  const [offers, setOffers] = useState<LineMarkSeriesPoint[]>([]);
  const [buys, setBuys] = useState<LineMarkSeriesPoint[]>([]);
  const [sells, setSells] = useState<LineMarkSeriesPoint[]>([]);

  useEffect(() => {
    async function fetchData() {
      const newOffers = await readOffers(token);
      const newBids = await readBids(token);
      const [newBuys, newSells] = await readTransactions(token);
      setOffers(newOffers);
      setBids(newBids);
      setBuys(newBuys);
      setSells(newSells);
    }

    fetchData()
      .then()
      .catch((err) => {
        console.log(err);
      });
  }, [token]);

  return (
    <div className="App">
      {props.title && (
        <Typography variant="h4" align="center">
          {props.title}
        </Typography>
      )}
      <Legend />
      <XYPlot height={400} width={1200}>
        <LineSeries data={bids as LineSeriesPoint[]} getNull={(d) => d.y !== null} color="blue" />
        <LineSeries data={offers as LineSeriesPoint[]} getNull={(d) => d.y !== null} color="blue" />
        <MarkSeries data={sells} getNull={(d) => d.y !== null} color="red" />
        <MarkSeries data={buys} getNull={(d) => d.y !== null} color="green" />
        <VerticalGridLines />
        <HorizontalGridLines />
        <XAxis />
        <YAxis />
      </XYPlot>
    </div>
  );
}
