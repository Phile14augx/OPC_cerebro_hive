import React from 'react';
import { BaseIcon } from '../BaseIcon';
import { BaseIconProps } from '../types';

export const LivingDigitalTwin = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <path d='M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 2 12 10 10 0 0 1 12 2z' stroke='var(--color-icon-primary)' opacity='0.3' /><path d='M12 2a10 10 0 0 1 10 10' stroke='var(--color-icon-accent)' /><rect x='8' y='8' width='8' height='8' rx='1' stroke='var(--color-icon-primary)' /><path d='M4 12h4' /><path d='M16 12h4' /><path d='M12 4v4' /><path d='M12 16v4' />
  </BaseIcon>
);
