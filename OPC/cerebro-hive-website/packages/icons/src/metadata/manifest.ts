
export interface IconMetadata {
  name: string;
  category: string;
  tags: string[];
  rtlMirrored: boolean;
  filledVariant: boolean;
}

export const iconManifest: Record<string, IconMetadata> = {
  agent: {
    name: 'agent',
    category: 'ai',
    tags: ['assistant', 'llm', 'copilot'],
    rtlMirrored: false,
    filledVariant: true
  },
  settings: {
    name: 'settings',
    category: 'core',
    tags: ['gear', 'preferences'],
    rtlMirrored: false,
    filledVariant: true
  }
};
