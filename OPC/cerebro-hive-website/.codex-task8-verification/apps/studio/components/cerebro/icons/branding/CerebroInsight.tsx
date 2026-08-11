import React from 'react';
import { BaseIcon } from '../BaseIcon';
import { BaseIconProps } from '../types';

export const CerebroInsight = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <path d='M2 20h20' stroke='var(--color-icon-primary)' /><path d='M5 20v-6' stroke='var(--color-icon-primary)' /><path d='M11 20v-10' stroke='var(--color-icon-primary)' /><path d='M17 20V4' stroke='var(--color-icon-accent)' /><circle cx='17' cy='4' r='2' fill='var(--color-icon-accent)' /><path d='M5 14l6-4 6-6' stroke='var(--color-icon-accent)' strokeDasharray='2 2' />
  </BaseIcon>
);
