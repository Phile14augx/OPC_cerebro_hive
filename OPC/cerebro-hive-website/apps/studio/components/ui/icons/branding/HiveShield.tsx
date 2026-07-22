import React from 'react';
import { BaseIcon } from '../BaseIcon';
import { BaseIconProps } from '../types';

export const HiveShield = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' stroke='var(--color-icon-primary)' /><path d='M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' stroke='var(--color-icon-accent)' /><path d='M12 12h.01' strokeWidth='3' stroke='var(--color-icon-accent)' strokeLinecap='round' />
  </BaseIcon>
);
