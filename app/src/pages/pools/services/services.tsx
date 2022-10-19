import React, { useEffect } from 'react';

export const Services = () => {
  // @ts-ignore
  useEffect(() => {}, []);

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/naming-convention
  return (
    <>
      {/* @ts-ignore */}
      {/* eslint-disable @typescript-eslint/naming-convention */}
      <div dangerouslySetInnerHTML={{ __html: "<iframe style='width: 100%;' src='https://status.solana.com' />" }} />
      {/* @ts-ignore */}
      <div
        dangerouslySetInnerHTML={{
          __html:
            "<iframe style='width: 100%;' src='https://cloudwatch.amazonaws.com/dashboard.html?dashboard=Dual-API&context=eyJSIjoidXMtZWFzdC0xIiwiRCI6ImN3LWRiLTc5MzI3NTc2OTU0OSIsIlUiOiJ1cy1lYXN0LTFfMkVVUUt3M3hzIiwiQyI6IjcyMzZzMmY0Y2FvY2kyNGdpOGVoMm1zcXRhIiwiSSI6InVzLWVhc3QtMTpjNDIwMzliYy0xOGJjLTQ2MjItYjZjOC00ZThiZmVmZWM4N2IiLCJNIjoiUHVibGljIn0%3D' />",
        }}
      />
    </>
  );
};
