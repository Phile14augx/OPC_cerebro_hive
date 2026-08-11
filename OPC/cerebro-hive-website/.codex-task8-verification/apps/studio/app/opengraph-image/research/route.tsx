import { ImageResponse } from 'next/og';
import { OgTemplate } from '@/lib/discovery/og/template';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET() {
  return new ImageResponse(
    <OgTemplate
      title="Research & Insights"
      subtitle="Enterprise AI research, implementation guides, and strategic frameworks from CerebroHive experts."
      label="Research"
      accent="#ec4899"
    />,
    { ...size },
  );
}
