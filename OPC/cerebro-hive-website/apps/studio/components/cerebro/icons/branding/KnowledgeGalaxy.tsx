import React from 'react';
import { BaseIcon } from '../BaseIcon';
import { BaseIconProps } from '../types';

export const KnowledgeGalaxy = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <ellipse cx='12' cy='12' rx='10' ry='4' transform='rotate(-45 12 12)' stroke='var(--color-icon-primary)' opacity='0.5' /><ellipse cx='12' cy='12' rx='10' ry='4' transform='rotate(45 12 12)' stroke='var(--color-icon-primary)' opacity='0.5' /><circle cx='12' cy='12' r='4' fill='var(--color-icon-accent)' /><circle cx='18' cy='6' r='1.5' fill='var(--color-icon-primary)' /><circle cx='6' cy='18' r='1.5' fill='var(--color-icon-primary)' /><circle cx='19' cy='19' r='1.5' fill='var(--color-icon-primary)' /><circle cx='5' cy='5' r='1.5' fill='var(--color-icon-primary)' />
  </BaseIcon>
);
