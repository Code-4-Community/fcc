/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { DonationForm } from './DonationForm';
import type { CreateDonationResponse } from '../../api/apiClient';

describe('DonationForm Component', () => {
  const onSuccess = vi.fn();
  const onError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('prevents advancing past Step 1 when amount is missing', async () => {
    render(
      <MemoryRouter>
        <DonationForm onSuccess={onSuccess} onError={onError} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.queryByText(/enter a positive amount/i)).not.toBeNull();
    });
  });

  it('shows payment details on Step 2 after entering amount', async () => {
    render(
      <MemoryRouter>
        <DonationForm onSuccess={onSuccess} onError={onError} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/donation amount/i), {
      target: { value: '45' },
    });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.queryByText(/payment details/i)).not.toBeNull();
      // Use getAllByText since $45.00 appears in multiple places
      const amounts = screen.getAllByText(/\$45\.00/);
      expect(amounts.length).toBeGreaterThan(0);
    });
  });

  it('submits donation after confirm and shows receipt', async () => {
    const spy = vi
      .spyOn(apiClient, 'createDonation')
      .mockResolvedValueOnce({ id: '123' });

    render(
      <MemoryRouter>
        <DonationForm onSuccess={onSuccess} onError={onError} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/donation amount/i), {
      target: { value: '50' },
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'Hello' },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Kitty' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'hello@kitty.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    fireEvent.click(screen.getByRole('button', { name: /confirm donation/i }));

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));

    expect(onSuccess).toHaveBeenCalledWith('123');
    expect(screen.queryByText(/thank you for your donation/i)).not.toBeNull();
  });

  it('displays error banner and calls onError when API fails', async () => {
    let rejectPending!: (reason?: unknown) => void;
    const pending = new Promise<CreateDonationResponse>((_, reject) => {
      rejectPending = reject;
    });

    const spy = vi
      .spyOn(apiClient, 'createDonation')
      .mockReturnValueOnce(pending as Promise<CreateDonationResponse>);

    render(
      <MemoryRouter>
        <DonationForm onSuccess={onSuccess} onError={onError} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/donation amount/i), {
      target: { value: '75' },
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@northeastern.edu' },
    });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    fireEvent.click(screen.getByRole('button', { name: /confirm donation/i }));

    rejectPending(new Error('Network error'));

    await waitFor(() => {
      expect(screen.queryByText(/network error/i)).not.toBeNull();
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
