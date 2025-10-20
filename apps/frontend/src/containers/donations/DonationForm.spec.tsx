/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import apiClient from '../../api/apiClient';
import { DonationForm } from './DonationForm';
import type { CreateDonationResponse } from '../../api/apiClient';

describe('DonationForm Component', () => {
  const onSuccess = vi.fn();
  const onError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation errors for empty fields', async () => {
    const spy = vi.spyOn(apiClient, 'createDonation');
    render(<DonationForm onSuccess={onSuccess} onError={onError} />);

    fireEvent.click(screen.getByRole('button', { name: /submit donation/i }));

    await waitFor(() => {
      expect(screen.queryByText(/first name is required/i)).not.toBeNull();
      expect(screen.queryByText(/last name is required/i)).not.toBeNull();
      expect(screen.queryByText(/email is required/i)).not.toBeNull();
      expect(screen.queryByText(/positive amount/i)).not.toBeNull();
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it('submits valid donation and calls onSuccess', async () => {
    const spy = vi
      .spyOn(apiClient, 'createDonation')
      .mockResolvedValueOnce({ id: '123' });

    render(<DonationForm onSuccess={onSuccess} onError={onError} />);

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'Hello' },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Kitty' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'hello@kitty.com' },
    });
    fireEvent.change(screen.getByLabelText(/donation amount/i), {
      target: { value: '25.50' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit donation/i }));

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));

    const payload = spy.mock.calls[0][0];
    expect(payload).toMatchObject({
      firstName: 'Hello',
      lastName: 'Kitty',
      email: 'hello@kitty.com',
      amount: 25.5,
    });
    expect(onSuccess).toHaveBeenCalledWith('123');
  });

  it('shows error banner and calls onError when API fails', async () => {
    const spy = vi
      .spyOn(apiClient, 'createDonation')
      .mockRejectedValueOnce(new Error('Network error'));

    render(<DonationForm onSuccess={onSuccess} onError={onError} />);

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@northeastern.edu' },
    });
    fireEvent.change(screen.getByLabelText(/donation amount/i), {
      target: { value: '50' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit donation/i }));

    await waitFor(() => {
      expect(screen.queryByText(/network error/i)).not.toBeNull();
    });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('disables submit button while submitting', async () => {
    let resolvePending!: (value: CreateDonationResponse) => void;

    const pending = new Promise<CreateDonationResponse>((resolve) => {
      resolvePending = resolve;
    });
    const spy = vi
      .spyOn(apiClient, 'createDonation')
      .mockReturnValueOnce(pending);

    render(<DonationForm onSuccess={onSuccess} onError={onError} />);

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'Scooby' },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doo' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'scooby@doobydoo.com' },
    });
    fireEvent.change(screen.getByLabelText(/donation amount/i), {
      target: { value: '100' },
    });

    const button = screen.getByRole('button', { name: /submit donation/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });

    resolvePending({ id: 'ok' });

    await waitFor(() => {
      expect((button as HTMLButtonElement).disabled).toBe(false);
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
