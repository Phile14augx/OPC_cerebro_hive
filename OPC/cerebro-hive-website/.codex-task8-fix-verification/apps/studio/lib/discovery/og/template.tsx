// Shared OG image template — used by all ImageResponse routes
export interface OgTemplateProps {
  title: string;
  subtitle?: string;
  label?: string;
  accent?: string; // hex color for accent bar
}

export function OgTemplate({ title, subtitle, label, accent = '#6366f1' }: OgTemplateProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: '#09090b',
        padding: '60px',
        position: 'relative',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: accent,
        }}
      />
      {/* Brand mark */}
      <div
        style={{
          position: 'absolute',
          top: '52px',
          left: '60px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 700,
          }}
        >
          C
        </div>
        <span style={{ color: '#a1a1aa', fontSize: '18px', letterSpacing: '0.05em' }}>
          CerebroHive
        </span>
      </div>

      {/* Label */}
      {label && (
        <div
          style={{
            display: 'flex',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              background: `${accent}22`,
              color: accent,
              fontSize: '14px',
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: '999px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              border: `1px solid ${accent}44`,
            }}
          >
            {label}
          </span>
        </div>
      )}

      {/* Title */}
      <div
        style={{
          color: '#fafafa',
          fontSize: title.length > 40 ? '52px' : '64px',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          maxWidth: '900px',
          marginBottom: subtitle ? '20px' : '0',
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            color: '#71717a',
            fontSize: '24px',
            lineHeight: 1.4,
            maxWidth: '800px',
          }}
        >
          {subtitle}
        </div>
      )}

      {/* Bottom domain */}
      <div
        style={{
          position: 'absolute',
          bottom: '52px',
          right: '60px',
          color: '#3f3f46',
          fontSize: '16px',
          letterSpacing: '0.05em',
        }}
      >
        cerebropchive.org
      </div>
    </div>
  );
}
