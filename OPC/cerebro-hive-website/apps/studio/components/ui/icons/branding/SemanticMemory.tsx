import React from 'react';
import { BaseIcon } from '../BaseIcon';
import { BaseIconProps } from '../types';

export const SemanticMemory = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <path d='M4 8l8-4 8 4-8 4-8-4z' stroke='var(--color-icon-accent)' /><path d='M4 12l8 4 8-4' stroke='var(--color-icon-primary)' opacity='0.5' /><path d='M4 16l8 4 8-4' stroke='var(--color-icon-primary)' opacity='0.5' /><circle cx='12' cy='12' r='1.5' fill='var(--color-icon-accent)' /><circle cx='12' cy='16' r='1.5' fill='var(--color-icon-primary)' /><line x1='12' y1='8' x2='12' y2='12' stroke='var(--color-icon-accent)' strokeDasharray='2 2' />
  </BaseIcon>
);
