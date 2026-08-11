import { ImageResponse } from 'next/og';
import { OgTemplate } from '@/lib/discovery/og/template';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET() {
  return new ImageResponse(
    <OgTemplate
      title="Hive Marketplace"
      subtitle="Curated AI agents, templates, connectors, and models for enterprise deployment."
      label="Marketplace"
      accent="#f97316"
    />,
    { ...size },
  );
}
