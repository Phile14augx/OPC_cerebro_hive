import React from 'react';
import { BaseIcon, BaseIconProps } from '../Icon';

export const Help = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <circle cx='12' cy='12' r='10' /><path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' stroke='var(--color-icon-accent)' /><path d='M12 17h.01' strokeWidth='3' stroke='var(--color-icon-accent)' strokeLinecap='round' />
  </BaseIcon>
);
