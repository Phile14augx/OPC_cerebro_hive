import React from 'react';
import { BaseIcon, BaseIconProps } from '../Icon';

export const LlmService = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' /><path d='M3.27 6.96L12 12.01l8.73-5.05' stroke='var(--color-icon-accent)' /><path d='M12 22.08V12' stroke='var(--color-icon-accent)' /><text x='12' y='16' fontSize='5' textAnchor='middle' fill='var(--color-icon-primary)' stroke='none' fontFamily='sans-serif' fontWeight='bold'>LLM</text>
  </BaseIcon>
);
