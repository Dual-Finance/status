import { ColumnsType } from 'antd/lib/table';
import cls from 'classnames';
import { DualfiTable } from '../../components/UI/DualfiTable/DualfiTable';
import styles from '../Pools.module.scss';
import { useSummary } from '../../hooks/useSummary';
import { dollarize, getTokenIconClass } from '../../utils/utils';

export const Summary = (props: { network: string }) => {
  const { network } = props;
  const summary = useSummary(network);

  const rows = Object.entries(summary || {});
  return (
    <DualfiTable
      className={styles.balanceTable}
      columns={columns}
      pagination={{ pageSize: 10 }}
      dataSource={rows.map((entry, key) => ({
        key: `summary-${key}`,
        name: entry[0],
        value: entry[1],
      }))}
      scroll={{ x: true }}
    />
  );
};

interface SummaryValue {
  key: React.Key;
  name: string;
  value: any;
}

const columns: ColumnsType<SummaryValue> = [
  {
    title: 'Metric',
    dataIndex: 'name',
    render: camelCaseToSpacedCapitalized,
  },
  {
    title: 'Value',
    dataIndex: 'value',
    render: renderValueCell,
  },
];

function camelCaseToSpacedCapitalized(input: string): string {
  // Split the string at each point where a lowercase letter is followed by an uppercase letter
  const words = input.split(/(?=[A-Z])/);

  // Capitalize the first letter of each word and join them with spaces
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function renderValueCell(value: number | string[], row: SummaryValue) {
  if (typeof value === 'number') {
    if (row.name === 'totalValueLocked') {
      return dollarize(value);
    }
    return value.toFixed(2);
  }

  return (
    <div className={cls(styles.premiumCell, styles.justifyEnd)}>
      {value.map((symbol) => {
        const project = projects[symbol];
        return (
          <a key={`icon-${symbol}`} href={project?.link} placeholder={project?.name}>
            <div className={cls(styles.tokenIcon, getTokenIconClass(symbol))} />
          </a>
        );
      })}
    </div>
  );
}

interface ProjectLink {
  name: string;
  link: string;
}
const projects: Record<string, ProjectLink> = {
  ALL: {
    name: 'AllDomains',
    link: 'https://alldomains.id/',
  },
  BONK: {
    name: 'Bonk',
    link: 'https://bonkcoin.com/',
  },
  DEAN: {
    name: "Dean's List",
    link: 'https://deanslist.services/',
  },
  DUAL: {
    name: 'Dual Finance',
    link: 'https://dual.finance/',
  },
  GUAC: {
    name: 'Guacamole',
    link: 'https://www.guacamole.gg/',
  },
  MNGO: {
    name: 'Mango Markets',
    link: 'https://mango.markets/',
  },
  SLCL: {
    name: 'Solcial',
    link: 'https://solcial.io/',
  },
  T: {
    name: 'Threshold Network',
    link: 'https://threshold.network/',
  },
  tBTC: {
    name: 'Threshold Bitcoin',
    link: 'https://dashboard.threshold.network/overview/network',
  },
  USDC: {
    name: 'USD Coin',
    link: 'https://www.circle.com/en/usdc',
  },
  wstETHpo: {
    name: 'Lido Wrapped Staked ETH',
    link: 'https://lido.fi/',
  },
};
