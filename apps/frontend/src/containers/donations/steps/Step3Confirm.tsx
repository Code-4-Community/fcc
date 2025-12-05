import React from 'react';
import type { DonationFormData } from '../donation-form.types';

interface Step3ConfirmProps {
  formData: DonationFormData;
}

export const Step3Confirm: React.FC<Step3ConfirmProps> = ({ formData }) => {
  const amount = parseFloat(formData.amount) || 0;

  return (
    <section>
      <h3>Step 3: Review your donation</h3>
      <div className="summary-card">
        <dl>
          <div>
            <dt>Amount</dt>
            <dd>${amount.toFixed(2)}</dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>
              {formData.donationType === 'one_time'
                ? 'One-time'
                : `Recurring (${formData.recurringInterval})`}
            </dd>
          </div>
          <div>
            <dt>Donor</dt>
            <dd>
              {formData.firstName} {formData.lastName}
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{formData.email}</dd>
          </div>
          <div>
            <dt>Anonymous?</dt>
            <dd>{formData.isAnonymous ? 'Yes' : 'No'}</dd>
          </div>
          {formData.dedicationMessage && (
            <div>
              <dt>Dedication</dt>
              <dd>{formData.dedicationMessage}</dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
};
