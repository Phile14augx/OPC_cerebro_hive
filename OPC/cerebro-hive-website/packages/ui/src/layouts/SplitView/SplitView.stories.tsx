import type { Meta, StoryObj } from '@storybook/react';
import { SplitView } from './SplitView';

const meta: Meta<typeof SplitView> = {
  title: 'Primitives/SplitView',
  component: SplitView,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SplitView>;

export const Default: Story = {
  args: {
    children: 'SplitView',
  },
};
