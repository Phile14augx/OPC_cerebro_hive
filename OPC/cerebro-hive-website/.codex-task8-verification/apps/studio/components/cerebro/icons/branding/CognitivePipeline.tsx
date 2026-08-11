import React from 'react';
import { BaseIcon } from '../BaseIcon';
import { BaseIconProps } from '../types';

export const CognitivePipeline = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <rect x='2' y='10' width='4' height='4' rx='1' stroke='var(--color-icon-primary)' /><rect x='10' y='10' width='4' height='4' rx='1' fill='var(--color-icon-accent)' stroke='none' /><rect x='18' y='10' width='4' height='4' rx='1' stroke='var(--color-icon-primary)' /><path d='M6 12h4' /><path d='M14 12h4' /><circle cx='12' cy='6' r='2' stroke='var(--color-icon-accent)' /><path d='M12 8v2' stroke='var(--color-icon-accent)' />
  </BaseIcon>
);
