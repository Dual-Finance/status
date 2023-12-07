import { ColumnsType } from 'antd/lib/table';
import { DualfiTable } from '../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';
import { useSummary } from '../../hooks/useSummary';

export const Summary = (props: { network: string }) => {
  const { network } = props;
  const summary = useSummary(network);

  return summary ? (
    <DualfiTable
      className={styles.balanceTable}
      columns={columns}
      pagination={{ pageSize: 10 }}
      dataSource={Object.entries(summary).map<SummaryValue>((entry, key) => ({
        key: `summary-${key}`,
        name: camelCaseToSpacedCapitalized(entry[0]),
        value: entry[1].toFixed(2),
      }))}
      scroll={{ x: true }}
    />
  ) : null;
};

type SummaryValue = { key: React.Key; name: string; value: string };

const columns: ColumnsType<SummaryValue[]> = [
  {
    title: 'Metric',
    dataIndex: 'name',
  },
  {
    title: 'Value',
    dataIndex: 'value',
  },
];

function camelCaseToSpacedCapitalized(input: string): string {
  // Split the string at each point where a lowercase letter is followed by an uppercase letter
  const words = input.split(/(?=[A-Z])/);

  // Capitalize the first letter of each word and join them with spaces
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
