import { ImageResponse } from 'next/og';
import { OgTemplate } from '@/lib/discovery/og/template';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET() {
  return new ImageResponse(
    <OgTemplate
      title="AI Software Products"
      subtitle="HivePulse, Cerebro X, Cerebro Archive, Cerebro Studio, and the full Cerebro suite."
      label="Products"
      accent="#10b981"
    />,
    { ...size },
  );
}
