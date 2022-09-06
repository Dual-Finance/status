import React, { useEffect } from 'react';

export const Services = () => {
  // @ts-ignore
  useEffect(() => {}, []);

  return (
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention
    <div dangerouslySetInnerHTML={{ __html: "<iframe style='width: 100%;' src='https://status.solana.com' />" }} />
  );
};
