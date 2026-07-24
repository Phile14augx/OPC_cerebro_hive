import React from 'react';
import { BaseIcon } from '../BaseIcon';
import { BaseIconProps } from '../types';

export const CerebroFlow = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <path d='M4 4h16' stroke='var(--color-icon-primary)' /><path d='M4 20h16' stroke='var(--color-icon-primary)' /><path d='M4 12h8' stroke='var(--color-icon-accent)' /><path d='M16 12h4' stroke='var(--color-icon-accent)' /><circle cx='14' cy='12' r='2' fill='var(--color-icon-accent)' />
  </BaseIcon>
);
