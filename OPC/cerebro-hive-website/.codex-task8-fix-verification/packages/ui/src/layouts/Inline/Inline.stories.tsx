import type { Meta, StoryObj } from '@storybook/react';
import { Inline } from './Inline';

const meta: Meta<typeof Inline> = {
  title: 'Primitives/Inline',
  component: Inline,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Inline>;

export const Default: Story = {
  args: {
    children: 'Inline',
  },
};
