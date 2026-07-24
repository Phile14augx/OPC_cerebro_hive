import React from 'react';
import { BaseIcon } from '../BaseIcon';
import { BaseIconProps } from '../types';

export const AgentSwarm = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <circle cx='12' cy='12' r='3' fill='var(--color-icon-accent)' /><circle cx='6' cy='6' r='2' stroke='var(--color-icon-primary)' /><circle cx='18' cy='6' r='2' stroke='var(--color-icon-primary)' /><circle cx='6' cy='18' r='2' stroke='var(--color-icon-primary)' /><circle cx='18' cy='18' r='2' stroke='var(--color-icon-primary)' /><path d='M7.5 7.5L10 10' stroke='var(--color-icon-accent)' strokeDasharray='2 2' /><path d='M16.5 7.5L14 10' stroke='var(--color-icon-accent)' strokeDasharray='2 2' /><path d='M7.5 16.5L10 14' stroke='var(--color-icon-accent)' strokeDasharray='2 2' /><path d='M16.5 16.5L14 14' stroke='var(--color-icon-accent)' strokeDasharray='2 2' />
  </BaseIcon>
);
