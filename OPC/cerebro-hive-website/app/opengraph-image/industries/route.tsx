import { ImageResponse } from 'next/og';
import { OgTemplate } from '@/lib/discovery/og/template';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET() {
  return new ImageResponse(
    <OgTemplate
      title="AI Solutions by Industry"
      subtitle="Purpose-built enterprise AI for Healthcare, Finance, Manufacturing, Legal, and more."
      label="Industries"
      accent="#06b6d4"
    />,
    { ...size },
  );
}
