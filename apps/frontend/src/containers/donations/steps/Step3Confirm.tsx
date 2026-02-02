import React from 'react';
import type { DonationFormData } from '../donation-form.types';
import { Card } from '@components/ui/card';

interface Step3ConfirmProps {
  formData: DonationFormData;
}

export const Step3Confirm: React.FC<Step3ConfirmProps> = ({ formData }) => {
  const amount = parseFloat(formData.amount) || 0;

  return (
    <section className="font-['Source_Sans_3']">
      <h1 className="font-semibold text-2xl">Confirm Payment</h1>
      <h3 className="text-[#55565A] font-light">
        Please confirm your information before preceeeding.
      </h3>
      <Card className="p-5 mt-4 mb-4 bg-[#EFEFEF] rounded-none shadow-none ring-0">
        <h2 className="self-start text-s font-bold">Transaction Details</h2>
        <dl className="flex flex-col justify-between gap-4 ">
          <div className="flex justify-between">
            <dt>Donor</dt>
            <dd>
              {formData.firstName} {formData.lastName}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Email</dt>
            <dd>{formData.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Anonymous?</dt>
            <dd>{formData.isAnonymous ? 'Yes' : 'No'}</dd>
          </div>
          <hr className="h-[1px] bg-black border-none" />
          <div className="flex justify-between">
            <dt>Recurrence</dt>
            <dd>
              {formData.donationType === 'one_time'
                ? 'One-time'
                : `Recurring (${formData.recurringInterval})`}
            </dd>
          </div>
          <div className="flex justify-between font-bold">
            <dt>Donation Amount</dt>
            <dd>${amount.toFixed(2)}</dd>
          </div>
          {/* {formData.dedicationMessage && (
            <div>
              <dt>Dedication</dt>
              <dd>{formData.dedicationMessage}</dd>
            </div>
          )} */}
        </dl>
      </Card>
    </section>
  );
};
