import React from 'react';
import { BaseIcon, BaseIconProps } from '../Icon';

export const AiRoadmap = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <path d='M9 20v-8h6v8' /><path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' /><circle cx='12' cy='12' r='2' fill='var(--color-icon-accent)' stroke='none' />
  </BaseIcon>
);
