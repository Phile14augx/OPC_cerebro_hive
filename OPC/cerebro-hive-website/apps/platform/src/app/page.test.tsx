import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Platform HomePage Behavioral Contract', () => {
  it('renders all platform navigation cards', () => {
    render(<Home />);
    expect(screen.getByText('Enterprise Workspace')).toBeDefined();
    expect(screen.getByText('CerebroStudio')).toBeDefined();
    expect(screen.getByText('Mission Control')).toBeDefined();
    expect(screen.getByText('Knowledge Explorer')).toBeDefined();
  });
});
