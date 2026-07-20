import React from 'react';
import { BaseIcon, BaseIconProps } from '../Icon';

export const ClearChat = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <path d='M3 6h18' /><path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' /><path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' stroke='var(--color-icon-accent)' /><line x1='10' x2='10' y1='11' y2='17' /><line x1='14' x2='14' y1='11' y2='17' />
  </BaseIcon>
);
