import React from 'react';
import { BaseIcon } from '../BaseIcon';
import { BaseIconProps } from '../types';

export const ReasoningEngine = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <rect x='3' y='4' width='18' height='16' rx='2' stroke='var(--color-icon-primary)' /><path d='M8 12h2' /><path d='M14 12h2' /><path d='M12 8v2' /><path d='M12 14v2' /><circle cx='12' cy='12' r='2' fill='var(--color-icon-accent)' /><circle cx='6' cy='12' r='2' stroke='var(--color-icon-primary)' /><circle cx='18' cy='12' r='2' stroke='var(--color-icon-primary)' /><line x1='12' y1='4' x2='12' y2='6' stroke='var(--color-icon-accent)' />
  </BaseIcon>
);
