import { ImageResponse } from 'next/og';
import { OgTemplate } from '@/lib/discovery/og/template';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET() {
  return new ImageResponse(
    <OgTemplate
      title="Intelligence. Connection. Impact."
      subtitle="Enterprise AI systems that transform how organizations operate, learn, and grow."
      accent="#6366f1"
    />,
    { ...size },
  );
}
