import React from 'react';
import { BaseIcon } from '../BaseIcon';
import { BaseIconProps } from '../types';

export const Terminal = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    <path d="M12 19h8" />
    <path d="m4 17 6-6-6-6" />
  </BaseIcon>
);
