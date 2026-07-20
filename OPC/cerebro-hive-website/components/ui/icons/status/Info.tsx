import React from 'react';
import { BaseIcon, BaseIconProps } from '../Icon';

export const Info = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <circle cx='12' cy='12' r='10' /><path d='M12 16v-4' stroke='var(--color-icon-accent)' /><path d='M12 8h.01' strokeWidth='3' stroke='var(--color-icon-accent)' strokeLinecap='round' />
  </BaseIcon>
);
