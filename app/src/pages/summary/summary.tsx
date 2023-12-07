import { ColumnsType } from 'antd/lib/table';
import { DualfiTable } from '../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';
import { useSummary } from '../../hooks/useSummary';
import { dollarize } from '../../utils/utils';

export const Summary = (props: { network: string }) => {
  const { network } = props;
  const summary = useSummary(network);

  return (
    <DualfiTable
      className={styles.balanceTable}
      columns={columns}
      pagination={{ pageSize: 10 }}
      dataSource={Object.entries(summary || []).map<SummaryValue>((entry, key) => ({
        key: `summary-${key}`,
        name: entry[0],
        value: entry[1].toString(),
      }))}
      scroll={{ x: true }}
    />
  );
};

interface SummaryValue {
  key: React.Key;
  name: string;
  value: string;
}

const columns: ColumnsType<SummaryValue> = [
  {
    title: 'Metric',
    dataIndex: 'name',
    render: (value: string) => camelCaseToSpacedCapitalized(value),
  },
  {
    title: 'Value',
    dataIndex: 'value',
    render: (value: number, row) => (row.name === 'tvl' ? dollarize(value) : value),
  },
];

function camelCaseToSpacedCapitalized(input: string): string {
  // Split the string at each point where a lowercase letter is followed by an uppercase letter
  const words = input.split(/(?=[A-Z])/);

  // Capitalize the first letter of each word and join them with spaces
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
