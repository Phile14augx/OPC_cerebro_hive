import React from 'react';
import { BaseIcon, BaseIconProps } from '../Icon';

export const More = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <circle cx='12' cy='12' r='10' /><circle cx='8' cy='12' r='1' fill='var(--color-icon-accent)' stroke='none' /><circle cx='12' cy='12' r='1' fill='var(--color-icon-accent)' stroke='none' /><circle cx='16' cy='12' r='1' fill='var(--color-icon-accent)' stroke='none' />
  </BaseIcon>
);
