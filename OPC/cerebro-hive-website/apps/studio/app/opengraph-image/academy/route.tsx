import { ImageResponse } from 'next/og';
import { OgTemplate } from '@/lib/discovery/og/template';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET() {
  return new ImageResponse(
    <OgTemplate
      title="CerebroHive Academy"
      subtitle="Professional AI certifications for enterprise teams — from foundations to advanced engineering."
      label="Academy"
      accent="#f59e0b"
    />,
    { ...size },
  );
}
