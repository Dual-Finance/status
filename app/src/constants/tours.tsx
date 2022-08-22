import { StepType } from '@reactour/tour';

export const APP_TOURS: StepType[] = [
  {
    selector: '[data-tut="connect_wallet"]',
    content: () => <div style={{ color: 'black' }}>Connect your Solana wallet extension to interact with the app</div>,
  },
  {
    selector: '[data-tut="select_product"]',
    content: () => <div style={{ color: 'black' }}>Select desired asset to generate yield</div>,
  },
  {
    selector: '[data-tut="apy_column"]',
    content: () => (
      <div style={{ color: 'black' }}>
        APYs are estimates of returns and are displayed for comparative purposes only. Note the Premium column provides
        the amount you will earn per token staked.
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tut="realtime_price"]',
    content: () => <div style={{ color: 'black' }}>The Premium you receive for Staking is streamed in real-time!</div>,
  },
  {
    selector: '[data-tut="stake_button"]',
    content: () => (
      <div style={{ color: 'black' }}>
        Click here to view details for each DIP and to Stake your tokens for immediate yield!
      </div>
    ),
  },
  {
    selector: '[data-tut="balance_menu"]',
    content: () => <div style={{ color: 'black' }}>After Staking view your DIP and rewarded Staking Options here.</div>,
  },
  {
    selector: '[data-tut="studio_menu"]',
    content: () => (
      <div style={{ color: 'black' }}>
        Navigate to the Studio to construct option incentive structures, view their value and price any crypto option!
      </div>
    ),
  },
  {
    selector: '[data-tut="docs_menu"]',
    content: () => (
      <div style={{ color: 'black' }}>
        Congratulations you are ready to earn sustainable yield via Dual Finance! Feel free to ask any further questions
        in discord &quot;support&quot; channel.
      </div>
    ),
    action: () => {
      window.localStorage.setItem('isDualFiTutor', 'true');
    },
  },
];
