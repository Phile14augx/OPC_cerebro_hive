import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Primitives/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  args: {
    children: 'Sidebar',
  },
};
