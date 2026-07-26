import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from './ScrollArea';

const meta: Meta<typeof ScrollArea> = {
  title: 'Primitives/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

export const Default: Story = {
  args: {
    children: 'ScrollArea',
  },
};
