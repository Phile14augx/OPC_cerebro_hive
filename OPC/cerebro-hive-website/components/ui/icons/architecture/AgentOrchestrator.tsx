import React from 'react';
import { BaseIcon, BaseIconProps } from '../Icon';

export const AgentOrchestrator = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <path d='M12 2v20' /><path d='M2 12h20' /><circle cx='12' cy='12' r='3' stroke='var(--color-icon-accent)' fill='var(--color-icon-accent)' /><circle cx='12' cy='2' r='2' /><circle cx='12' cy='22' r='2' /><circle cx='2' cy='12' r='2' /><circle cx='22' cy='12' r='2' />
  </BaseIcon>
);
