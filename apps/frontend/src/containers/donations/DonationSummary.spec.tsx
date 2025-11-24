/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DonationSummary } from './DonationSummary';
import { DONATION_FEE_RATE, DONATION_FIXED_FEE } from './DonationSummary';

describe('DonationSummary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // unit tests for fee calculation

  // fee calculation with default values
  it('calculates the fee with default values', () => {
    const baseAmount = Math.random() * 10;
    const feeTotal = (
      (baseAmount * DONATION_FEE_RATE) / 100 +
      DONATION_FIXED_FEE
    ).toFixed(2);
    render(<DonationSummary baseAmount={baseAmount} />);
    expect(
      screen.queryByText(
        new RegExp(
          `Add \\$${feeTotal} to cover transaction fees and tip the fundraising platform to help keep it`,
        ),
      ),
    ).not.toBeNull();
  });

  // fee calculation with custom values
  it('calculates the fee with default values', () => {
    const baseAmount = Math.random() * 10;
    const feeRate = Math.random() * 10;
    const fixedFee = Math.random() * 10;
    const feeTotal = ((baseAmount * feeRate) / 100 + fixedFee).toFixed(2);
    render(
      <DonationSummary
        baseAmount={baseAmount}
        feeRate={feeRate}
        fixedFee={fixedFee}
      />,
    );
    expect(
      screen.queryByText(
        new RegExp(
          `Add \\$${feeTotal} to cover transaction fees and tip the fundraising platform to help keep it`,
        ),
      ),
    ).not.toBeNull();
  });

  // donation total calculation does not include fee when initially rendered
  it('calculates total donation amount without fee when initially rendered', async () => {
    const baseAmount = Math.random() * 10;

    // initial rendering does not include fee in total donation calculation
    render(<DonationSummary baseAmount={baseAmount} />);
    expect(
      screen.queryByText(new RegExp(`\\$${baseAmount.toFixed(2)}`)),
    ).not.toBeNull();
  });

  // donation total calculation includes fee when toggle activated
  it('calculates total donation amount with fee when toggle activated', async () => {
    const baseAmount = Math.random() * 10;
    const feeTotal =
      (baseAmount * DONATION_FEE_RATE) / 100 + DONATION_FIXED_FEE;
    render(<DonationSummary baseAmount={baseAmount} />);

    // activate fee toggle
    const feeToggle = screen.getAllByTestId('fee-toggle');
    fireEvent.click(feeToggle[0]);

    // donation total calculation should include fee
    expect(
      screen.queryByText(
        new RegExp(`\\$${(baseAmount + feeTotal).toFixed(2)}`),
      ),
    ).not.toBeNull();

    fireEvent.click(feeToggle[0]);

    // donation total calculation should not include fee
    expect(
      screen.queryByText(new RegExp(`\\$${baseAmount.toFixed(2)}`)),
    ).not.toBeNull();
  });
});
