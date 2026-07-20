import React from 'react';
import { BaseIcon, BaseIconProps } from '../Icon';

export const NewChat = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' /><line x1='9' x2='15' y1='10' y2='10' stroke='var(--color-icon-accent)' /><line x1='12' x2='12' y1='7' y2='13' stroke='var(--color-icon-accent)' />
  </BaseIcon>
);
