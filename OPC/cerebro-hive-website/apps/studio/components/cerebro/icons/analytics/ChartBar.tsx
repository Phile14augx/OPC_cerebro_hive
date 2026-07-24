import React from 'react';
import { BaseIcon } from '../BaseIcon';
import { BaseIconProps } from '../types';

export const ChartBar = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <path d="M5 21v-6" />
    <path d="M12 21V9" />
    <path d="M19 21V3" />
  </BaseIcon>
);
