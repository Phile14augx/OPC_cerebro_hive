import { ImageResponse } from 'next/og';
import { OgTemplate } from '@/lib/discovery/og/template';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET() {
  return new ImageResponse(
    <OgTemplate
      title="Developer Portal"
      subtitle="APIs, SDKs, architecture guides, and MCP integrations for building on CerebroHive."
      label="Developers"
      accent="#3b82f6"
    />,
    { ...size },
  );
}
