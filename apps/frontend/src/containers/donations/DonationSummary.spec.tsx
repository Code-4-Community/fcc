/** @vitest-environment jsdom */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
  DonationSummary,
  calculateFeeTotal,
  calculateChargeAmount,
  DONATION_FEE_RATE,
  DONATION_FIXED_FEE,
} from './DonationSummary';

describe('fee calculations', () => {
  it('grosses up so the org nets the base after Stripe takes its cut', () => {
    const base = 50;
    const charged = base + calculateFeeTotal(base);
    const net =
      charged - (charged * DONATION_FEE_RATE) / 100 - DONATION_FIXED_FEE;
    expect(net).toBeCloseTo(base, 5);
  });

  it('supports custom rate/fixed fee', () => {
    const base = 40;
    const charged = base + calculateFeeTotal(base, 5, 1);
    const net = charged - (charged * 5) / 100 - 1;
    expect(net).toBeCloseTo(base, 5);
  });

  it('returns a zero fee for non-positive base amounts', () => {
    expect(calculateFeeTotal(0)).toBe(0);
    expect(calculateFeeTotal(-5)).toBe(0);
  });

  it('calculateChargeAmount returns the base when coverFees is off', () => {
    expect(calculateChargeAmount(50, false)).toBe(50);
    expect(calculateChargeAmount(0, true)).toBe(0);
  });

  it('calculateChargeAmount adds the fee (rounded to cents) when coverFees is on', () => {
    const expected = Math.round((50 + calculateFeeTotal(50)) * 100) / 100;
    const charge = calculateChargeAmount(50, true);
    expect(charge).toBe(expected);
    expect(charge).toBeGreaterThan(50);
    // rounded to whole cents
    expect(Math.round(charge * 100)).toBe(charge * 100);
  });
});

describe('DonationSummary Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the gross-up fee amount in the prompt', () => {
    const base = 50;
    const feeTotal = calculateFeeTotal(base).toFixed(2);
    render(
      <DonationSummary
        baseAmount={base}
        coverFees={false}
        onCoverFeesChange={vi.fn()}
      />,
    );
    expect(
      screen.queryByText(
        new RegExp(`Add \\$${feeTotal} to cover transaction fees`),
      ),
    ).not.toBeNull();
  });

  it('is controlled: toggling emits the negated coverFees value', () => {
    const onCoverFeesChange = vi.fn();

    const { rerender } = render(
      <DonationSummary
        baseAmount={50}
        coverFees={false}
        onCoverFeesChange={onCoverFeesChange}
      />,
    );
    fireEvent.click(screen.getByTestId('fee-toggle'));
    expect(onCoverFeesChange).toHaveBeenCalledWith(true);

    rerender(
      <DonationSummary
        baseAmount={50}
        coverFees={true}
        onCoverFeesChange={onCoverFeesChange}
      />,
    );
    fireEvent.click(screen.getByTestId('fee-toggle'));
    expect(onCoverFeesChange).toHaveBeenCalledWith(false);
  });
});
