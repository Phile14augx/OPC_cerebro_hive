const fs = require('fs');
const path = require('path');

const tokensDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages', 'tokens', 'src');

const dirs = ['core', 'semantic', 'component'];
dirs.forEach(d => fs.mkdirSync(path.join(tokensDir, d), { recursive: true }));

// CORE TOKENS
fs.writeFileSync(path.join(tokensDir, 'core', 'color.json'), JSON.stringify({
  color: {
    white: { value: '#ffffff' },
    black: { value: '#000000' },
    gray: {
      50: { value: '#f9fafb' },
      100: { value: '#f3f4f6' },
      200: { value: '#e5e7eb' },
      300: { value: '#d1d5db' },
      400: { value: '#9ca3af' },
      500: { value: '#6b7280' },
      600: { value: '#4b5563' },
      700: { value: '#374151' },
      800: { value: '#1f2937' },
      900: { value: '#111827' },
      950: { value: '#030712' }
    },
    emerald: {
      500: { value: '#10b981' },
      600: { value: '#059669' }
    },
    blue: {
      500: { value: '#3b82f6' }
    },
    red: {
      500: { value: '#ef4444' }
    },
    amber: {
      500: { value: '#f59e0b' }
    }
  }
}, null, 2));

fs.writeFileSync(path.join(tokensDir, 'core', 'spacing.json'), JSON.stringify({
  spacing: {
    0: { value: '0px' },
    1: { value: '4px' },
    2: { value: '8px' },
    3: { value: '12px' },
    4: { value: '16px' },
    5: { value: '20px' },
    6: { value: '24px' },
    8: { value: '32px' },
    10: { value: '40px' },
    12: { value: '48px' },
    16: { value: '64px' }
  }
}, null, 2));

fs.writeFileSync(path.join(tokensDir, 'core', 'radius.json'), JSON.stringify({
  radius: {
    none: { value: '0px' },
    sm: { value: '2px' },
    DEFAULT: { value: '4px' },
    md: { value: '6px' },
    lg: { value: '8px' },
    xl: { value: '12px' },
    full: { value: '9999px' }
  }
}, null, 2));

fs.writeFileSync(path.join(tokensDir, 'core', 'typography.json'), JSON.stringify({
  fontFamily: {
    sans: { value: '"Inter", sans-serif' },
    mono: { value: '"JetBrains Mono", monospace' }
  },
  fontSize: {
    xs: { value: '0.75rem', lineHeight: '1rem' },
    sm: { value: '0.875rem', lineHeight: '1.25rem' },
    base: { value: '1rem', lineHeight: '1.5rem' },
    lg: { value: '1.125rem', lineHeight: '1.75rem' },
    xl: { value: '1.25rem', lineHeight: '1.75rem' },
    '2xl': { value: '1.5rem', lineHeight: '2rem' }
  },
  fontWeight: {
    normal: { value: '400' },
    medium: { value: '500' },
    semibold: { value: '600' },
    bold: { value: '700' }
  }
}, null, 2));

// SEMANTIC TOKENS
fs.writeFileSync(path.join(tokensDir, 'semantic', 'light.json'), JSON.stringify({
  color: {
    background: {
      primary: { value: '{color.white.value}' },
      secondary: { value: '{color.gray.50.value}' },
      tertiary: { value: '{color.gray.100.value}' }
    },
    foreground: {
      primary: { value: '{color.gray.900.value}' },
      secondary: { value: '{color.gray.600.value}' },
      muted: { value: '{color.gray.500.value}' }
    },
    border: {
      default: { value: '{color.gray.200.value}' },
      subtle: { value: '{color.gray.100.value}' }
    },
    accent: {
      primary: { value: '{color.emerald.600.value}' },
      danger: { value: '{color.red.500.value}' },
      warning: { value: '{color.amber.500.value}' },
      info: { value: '{color.blue.500.value}' }
    }
  }
}, null, 2));

fs.writeFileSync(path.join(tokensDir, 'semantic', 'dark.json'), JSON.stringify({
  color: {
    background: {
      primary: { value: '{color.gray.950.value}' },
      secondary: { value: '{color.gray.900.value}' },
      tertiary: { value: '{color.gray.800.value}' }
    },
    foreground: {
      primary: { value: '{color.gray.50.value}' },
      secondary: { value: '{color.gray.400.value}' },
      muted: { value: '{color.gray.500.value}' }
    },
    border: {
      default: { value: '{color.gray.800.value}' },
      subtle: { value: '{color.gray.900.value}' }
    },
    accent: {
      primary: { value: '{color.emerald.500.value}' },
      danger: { value: '{color.red.500.value}' },
      warning: { value: '{color.amber.500.value}' },
      info: { value: '{color.blue.500.value}' }
    }
  }
}, null, 2));

// COMPONENT TOKENS
fs.writeFileSync(path.join(tokensDir, 'component', 'button.json'), JSON.stringify({
  button: {
    primary: {
      bg: { value: '{color.accent.primary.value}' },
      text: { value: '{color.white.value}' },
      hoverBg: { value: '{color.emerald.600.value}' } // Will use semantic re-mapping in future
    }
  }
}, null, 2));
