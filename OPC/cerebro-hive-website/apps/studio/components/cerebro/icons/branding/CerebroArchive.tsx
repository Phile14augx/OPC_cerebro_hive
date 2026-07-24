import React from 'react';
import { BaseIcon } from '../BaseIcon';
import { BaseIconProps } from '../types';

export const CerebroArchive = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <path d='M21 8v13H3V8' stroke='var(--color-icon-primary)' /><path d='M1 3h22v5H1z' stroke='var(--color-icon-accent)' /><path d='M10 12h4' stroke='var(--color-icon-primary)' /><path d='M7 16h10' stroke='var(--color-icon-primary)' opacity='0.5' />
  </BaseIcon>
);
