import { Typography } from '@mui/material';
import { Box } from '@mui/system';

export function Legend() {
  return (
    <Box display="flex" gap={3} justifyContent="center" width="100%">
      <Box display="flex" gap={1} alignItems="center">
        <Line color="blue" width={4} />
        <Typography variant="body1" color="textPrimary">
          Orders
        </Typography>
      </Box>
      <Box display="flex" gap={1} alignItems="center">
        <Circle color="green" size="12px" />
        <Typography variant="body1" color="textPrimary">
          Buy
        </Typography>
      </Box>
      <Box display="flex" gap={1} alignItems="center">
        <Circle color="red" size="12px" />
        <Typography variant="body1" color="textPrimary">
          Sell
        </Typography>
      </Box>
    </Box>
  );
}

type LineProps = {
  color: string;
  width: number;
};

function Line({ color, width }: LineProps) {
  return <Box bgcolor={color} width={`${width * 3}px`} height={`${width}px`} />;
}

type CircleProps = {
  color: string;
  size: string;
};

function Circle({ color, size }: CircleProps) {
  return <Box bgcolor={color} width={size} height={size} borderRadius={size} />;
}
