import React from 'react';

interface Step4ReceiptProps {
  receiptId: string | null;
}

export const Step4Receipt: React.FC<Step4ReceiptProps> = () => {
  return (
    <section>
      <h3>Step 4: Receipt</h3>
      <p>Thank you for your donation!</p>
    </section>
  );
};
