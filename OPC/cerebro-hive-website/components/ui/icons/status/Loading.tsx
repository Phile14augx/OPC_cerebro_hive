import React from 'react';
import { BaseIcon, BaseIconProps } from '../Icon';

export const Loading = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <path d='M12 2v4' stroke='var(--color-icon-accent)' /><path d='m16.2 7.8 2.9-2.9' stroke='var(--color-icon-accent)' /><path d='M18 12h4' stroke='var(--color-icon-accent)' /><path d='m16.2 16.2 2.9 2.9' stroke='var(--color-icon-accent)' /><path d='M12 18v4' stroke='var(--color-icon-accent)' /><path d='m4.9 19.1 2.9-2.9' stroke='var(--color-icon-accent)' /><path d='M2 12h4' stroke='var(--color-icon-accent)' /><path d='m4.9 4.9 2.9 2.9' stroke='var(--color-icon-accent)' />
  </BaseIcon>
);
