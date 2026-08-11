import React from 'react';
import { BaseIcon } from '../BaseIcon';
import { BaseIconProps } from '../types';

export const CerebroStudio = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <path d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' stroke='var(--color-icon-primary)' /><polyline points='14 2 14 8 20 8' stroke='var(--color-icon-primary)' /><path d='M8 13h2' stroke='var(--color-icon-accent)' /><path d='M14 13h2' stroke='var(--color-icon-accent)' /><circle cx='12' cy='13' r='1' fill='var(--color-icon-accent)' />
  </BaseIcon>
);
