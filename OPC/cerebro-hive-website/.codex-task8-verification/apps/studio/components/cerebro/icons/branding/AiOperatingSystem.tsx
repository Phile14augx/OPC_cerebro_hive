import React from 'react';
import { BaseIcon } from '../BaseIcon';
import { BaseIconProps } from '../types';

export const AiOperatingSystem = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <circle cx='12' cy='12' r='10' stroke='var(--color-icon-primary)' strokeDasharray='5 3' /><circle cx='12' cy='12' r='6' stroke='var(--color-icon-accent)' /><path d='M12 2v4' /><path d='M12 18v4' /><path d='M2 12h4' /><path d='M18 12h4' /><circle cx='12' cy='12' r='2' fill='var(--color-icon-primary)' />
  </BaseIcon>
);
