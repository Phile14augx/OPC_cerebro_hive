import React from 'react';
import { BaseIcon } from '../BaseIcon';
import { BaseIconProps } from '../types';

export const NeuralFabric = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <path d='M4 4h16v16H4z' stroke='var(--color-icon-primary)' strokeDasharray='4 4' opacity='0.5' /><circle cx='8' cy='8' r='2' fill='var(--color-icon-accent)' /><circle cx='16' cy='8' r='2' fill='var(--color-icon-accent)' /><circle cx='8' cy='16' r='2' fill='var(--color-icon-accent)' /><circle cx='16' cy='16' r='2' fill='var(--color-icon-accent)' /><circle cx='12' cy='12' r='3' stroke='var(--color-icon-primary)' /><line x1='8' y1='8' x2='10' y2='10' /><line x1='16' y1='8' x2='14' y2='10' /><line x1='8' y1='16' x2='10' y2='14' /><line x1='16' y1='16' x2='14' y2='14' />
  </BaseIcon>
);
