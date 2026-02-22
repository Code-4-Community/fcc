import React from 'react';
import type { DonationFormData } from '../donation-form.types';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';

interface Step3ConfirmProps {
  formData: DonationFormData;
}

export const Step3Confirm: React.FC<Step3ConfirmProps> = ({ formData }) => {
  const amount = parseFloat(formData.amount) || 0;

  return (
    <section className="font-sans space-y-4">
      <div className="space-y-1">
        <h1 className="font-semibold text-2xl">Confirm Payment</h1>
        <p className="text-[#55565A] font-normal text-sm">
          Please confirm your information before proceeding.
        </p>
      </div>

      <Card className="bg-[#EFEFEF] border-none shadow-none rounded-md ring-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold tracking-wider text-muted-foreground">
            Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4 text-base">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Donor</dt>
              <dd className="font-medium text-foreground">
                {formData.firstName} {formData.lastName}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium text-foreground">{formData.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Anonymous?</dt>
              <dd className="font-medium text-foreground">
                {formData.isAnonymous ? 'Yes' : 'No'}
              </dd>
            </div>

            <div className="h-[1px] w-full bg-black/20" aria-hidden="true" />

            <div className="flex justify-between">
              <dt className="text-muted-foreground">Recurrence</dt>
              <dd className="font-medium text-foreground">
                {formData.donationType === 'one_time'
                  ? 'One-time'
                  : `Recurring (${formData.recurringInterval})`}
              </dd>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2">
              <dt>Donation Amount</dt>
              <dd>${amount.toFixed(2)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </section>
  );
};
