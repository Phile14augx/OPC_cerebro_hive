import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

let currentSearchParams = new URLSearchParams('q=initial&type=papers&domain=AI+Foundations');
const replace = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/research',
  useRouter: () => ({ replace }),
  useSearchParams: () => currentSearchParams,
}));

vi.mock('./PublicationCard', () => ({
  PublicationCard: ({ pub }: { pub: { title: string } }) => <article>{pub.title}</article>,
}));

import { PublicationGrid } from './PublicationGrid';

afterEach(() => {
  currentSearchParams = new URLSearchParams('q=initial&type=papers&domain=AI+Foundations');
  replace.mockReset();
});

describe('PublicationGrid URL filter synchronization', () => {
  it('renders external query changes without replacing them, then writes interactive changes to the current URL', () => {
    const { rerender } = render(<PublicationGrid />);

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('initial');
    expect(replace).not.toHaveBeenCalled();

    currentSearchParams = new URLSearchParams('q=history&type=benchmarks&domain=Enterprise+AI&view=compact');
    rerender(<PublicationGrid />);

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('history');
    expect(replace).not.toHaveBeenCalled();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'updated' } });

    expect(replace).toHaveBeenCalledWith(
      '/research?q=updated&type=benchmarks&domain=Enterprise+AI&view=compact',
      { scroll: false },
    );
  });
});
