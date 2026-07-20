import type { Meta, StoryObj } from '@storybook/react';
import { Terminal, Api } from '../../components/ui/icons/developer';

const meta: Meta = {
  title: 'Icons/Developer',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: [16, 20, 24, 32, 48, 64],
    },
    variant: {
      control: { type: 'select' },
      options: ['outline', 'duotone', 'filled', 'rounded', 'sharp', 'solid', 'mini'],
    },
    animation: {
      control: { type: 'select' },
      options: ['idle', 'hover', 'active', 'loading', 'attention', 'success', 'error', 'disabled', 'transition', 'pulse', 'flow', 'orbit', 'sparkle', 'rotate', 'float', 'scan', 'ping', 'draw', 'breathe', 'ripple', 'wave', 'magnetic', 'glow'],
    },
    animated: {
      control: 'boolean',
    },
    color: {
      control: 'text',
      description: 'Color token (e.g. primary, accent) or hex',
    },
    secondaryColor: {
      control: 'text',
    },
  },
};

export default meta;


export const Terminal: StoryObj = {
  render: (args) => <Terminal {...args} />,
  args: {
    size: 64,
    variant: 'duotone',
    animation: 'idle',
    animated: false,
    color: 'primary',
  },
};


export const Api: StoryObj = {
  render: (args) => <Api {...args} />,
  args: {
    size: 64,
    variant: 'duotone',
    animation: 'idle',
    animated: false,
    color: 'primary',
  },
};

