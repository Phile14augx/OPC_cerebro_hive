import { ImageResponse } from 'next/og';
import { OgTemplate } from '@/lib/discovery/og/template';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET() {
  return new ImageResponse(
    <OgTemplate
      title="Enterprise AI Services"
      subtitle="AI Strategy, Platform Engineering, Autonomous Transformation, and more."
      label="Services"
      accent="#8b5cf6"
    />,
    { ...size },
  );
}
