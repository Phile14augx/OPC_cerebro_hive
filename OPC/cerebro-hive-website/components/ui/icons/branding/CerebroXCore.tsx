import React from 'react';
import { BaseIcon } from '../BaseIcon';
import { BaseIconProps } from '../types';

export const CerebroXCore = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <path d='M12 2L3 7v10l9 5 9-5V7l-9-5z' stroke='var(--color-icon-primary)' fill='var(--color-icon-secondary)' opacity='0.2' /><path d='M12 5L5 9v6l7 4 7-4V9l-7-4z' stroke='var(--color-icon-accent)' /><circle cx='12' cy='12' r='2' fill='var(--color-icon-accent)' /><line x1='12' y1='2' x2='12' y2='5' /><line x1='3' y1='7' x2='5' y2='9' /><line x1='21' y1='7' x2='19' y2='9' /><line x1='3' y1='17' x2='5' y2='15' /><line x1='21' y1='17' x2='19' y2='15' /><line x1='12' y1='22' x2='12' y2='19' />
  </BaseIcon>
);
