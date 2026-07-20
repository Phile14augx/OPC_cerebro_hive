import React from 'react';
import { BaseIcon, BaseIconProps } from '../Icon';

export const UserMessage = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <circle cx='12' cy='12' r='10' /><circle cx='12' cy='10' r='3' stroke='var(--color-icon-accent)' /><path d='M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662' stroke='var(--color-icon-accent)' />
  </BaseIcon>
);
