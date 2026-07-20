import React from 'react';
import { BaseIcon, BaseIconProps } from '../Icon';

export const AiStrategy = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <circle cx='12' cy='12' r='10' /><circle cx='12' cy='12' r='6' /><circle cx='12' cy='12' r='2' fill='var(--color-icon-accent)' stroke='var(--color-icon-accent)' />
  </BaseIcon>
);
