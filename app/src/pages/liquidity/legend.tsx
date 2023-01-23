import { Typography } from '@mui/material';
import { Box } from '@mui/system';

export function Legend() {
  return (
    <Box display="flex" gap={3} justifyContent="center" width="100%">
      <Box display="flex" gap={1} alignItems="center">
        <Square color="green" size="12px" />
        <Typography variant="body1" color="textPrimary">
          Buy
        </Typography>
      </Box>
      <Box display="flex" gap={1} alignItems="center">
        <Square color="red" size="12px" />
        <Typography variant="body1" color="textPrimary">
          Sell
        </Typography>
      </Box>
    </Box>
  );
}

type SquareProps = {
  color: string;
  size: string;
};

function Square({ color, size }: SquareProps) {
  return <Box bgcolor={color} width={size} height={size} />;
}
