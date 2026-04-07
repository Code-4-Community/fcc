import apiClient, {
  type CreateDonationResponse,
  type CreateDonationRequest,
} from '../../api/apiClient';
import React, { useRef, useState } from 'react';
import { type Step2DetailsRef } from './steps/Step2Details';
import './donations.css';
import {
  DonationFormData,
  DonationFormProps,
  FormErrors,
  DonationStep,
} from './donation-form.types';
import { Step1Amount } from './steps/Step1Amount';
import { Step2Details } from './steps/Step2Details';
import { Step3Confirm } from './steps/Step3Confirm';
import { Step4Receipt } from './steps/Step4Receipt';
import { StripeProvider } from './StripeProvider';

export const DonationForm: React.FC<DonationFormProps> = ({
  onSuccess,
  onError,
  onAmountChange,
}) => {
  const [currentStep, setCurrentStep] = useState<DonationStep>(1);
  const [formData, setFormData] = useState<DonationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    amount: '',
    isAnonymous: false,
    donationType: 'one_time',
    dedicationMessage: '',
    showDedicationPublicly: false,
    recurringInterval: 'monthly',
    isDedicated: false,
    dedicationKind: null,
    coverFees: false,
  });

  const [errors, setErrors] = useState<Partial<FormErrors>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const step2Ref = useRef<Step2DetailsRef>(null);

  const clampStep = (value: number): DonationStep =>
    Math.max(1, Math.min(4, value)) as DonationStep;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const assignError = (
    draft: Partial<FormErrors>,
    field: keyof FormErrors,
    message?: string,
  ) => {
    draft[field] = message;
    return !!message;
  };

  const validateStep = (step: DonationStep): boolean => {
    const nextErrors: Partial<FormErrors> = { ...errors };
    let hasError = false;

    if (step === 1) {
      const amountNum = parseFloat(formData.amount);
      const amountOK =
        /^\d+(\.\d{1,2})?$/.test(formData.amount) &&
        !isNaN(amountNum) &&
        amountNum > 0;
      hasError =
        assignError(
          nextErrors,
          'amount',
          amountOK ? undefined : 'Enter a positive amount (max 2 decimals)',
        ) || hasError;

      if (formData.donationType === 'recurring') {
        hasError =
          assignError(
            nextErrors,
            'recurringInterval',
            formData.recurringInterval
              ? undefined
              : 'Please select recurring interval',
          ) || hasError;
      } else {
        nextErrors.recurringInterval = undefined;
      }
    }

    if (step === 2) {
      hasError =
        assignError(
          nextErrors,
          'firstName',
          formData.firstName.trim() ? undefined : 'First name is required',
        ) || hasError;
      hasError =
        assignError(
          nextErrors,
          'lastName',
          formData.lastName.trim() ? undefined : 'Last name is required',
        ) || hasError;

      let emailError: string | undefined;
      if (!formData.email.trim()) {
        emailError = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        emailError = 'Please enter a valid email';
      }
      hasError = assignError(nextErrors, 'email', emailError) || hasError;
    }

    setErrors(nextErrors);
    return !hasError;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, type, value } = e.target;
    const next =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: next,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    if (name === 'donationType' && value === 'one_time') {
      setErrors((prev) => ({ ...prev, recurringInterval: undefined }));
    }

    if (name === 'amount' && onAmountChange) {
      const amountNum = parseFloat(value);
      if (!isNaN(amountNum) && amountNum > 0) {
        onAmountChange(amountNum);
      }
    }

    setSubmitError(null);
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return;
    }
    if (currentStep === 2) {
      try {
        const pmId = await step2Ref.current?.createPaymentMethod();
        if (!pmId) {
          setSubmitError('Could not process card. Please try again.');
          return;
        }
        setPaymentMethodId(pmId);
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : 'Could not process card.',
        );
        return;
      }
    }
    setCurrentStep((prev) => clampStep(prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => clampStep(prev - 1));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      amount: '',
      isAnonymous: false,
      donationType: 'one_time',
      dedicationMessage: '',
      showDedicationPublicly: false,
      recurringInterval: 'monthly',
      coverFees: false,
    });
    setErrors({});
    setReceiptId(null);
    setSubmitError(null);
    setCurrentStep(1);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      const payload: CreateDonationRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        amount: parseFloat(formData.amount),
        isAnonymous: formData.isAnonymous,
        donationType: formData.donationType,
        dedicationMessage: formData.dedicationMessage,
        showDedicationPublicly: formData.showDedicationPublicly,
        paymentIntentId,
        ...(formData.donationType === 'recurring' && {
          recurringInterval: formData.recurringInterval,
        }),
      };

      const response: CreateDonationResponse =
        await apiClient.createDonation(payload);

      onSuccess(response.id);
      setReceiptId(response.id);
      setCurrentStep(4);
    } catch (error) {
      const err = error as Error;
      setSubmitError(err.message || 'Failed to record donation');
      onError(err);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Amount
            formData={formData}
            errors={errors}
            isSubmitting={isSubmitting}
            onChange={handleInputChange}
          />
        );
      case 2:
        return (
          <StripeProvider>
            <Step2Details
              ref={step2Ref}
              formData={formData}
              errors={errors}
              isSubmitting={isSubmitting}
              onChange={handleInputChange}
            />
          </StripeProvider>
        );
      case 3:
        return (
          <StripeProvider>
            <Step3Confirm
              formData={formData}
              paymentMethodId={paymentMethodId}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={(error) => setSubmitError(error)}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
          </StripeProvider>
        );
      case 4:
      default:
        return <Step4Receipt receiptId={receiptId} />;
    }
  };

  const showBackButton = currentStep > 1 && currentStep < 4;
  const showNextButton = currentStep < 3;

  return (
    <div className="donation-form-container">
      <form
        className="donation-form"
        onSubmit={(e) => e.preventDefault()}
        noValidate
      >
        <div className="progress-bar-container">
          <div
            className={
              currentStep === 1 ? 'progress-bar-purple' : 'progress-bar-grey'
            }
          ></div>
          <div
            className={
              currentStep === 2 ? 'progress-bar-purple' : 'progress-bar-grey'
            }
          ></div>
          <div
            className={
              currentStep === 3 ? 'progress-bar-purple' : 'progress-bar-grey'
            }
          ></div>
        </div>
        {submitError && (
          <div className="error-banner" role="alert" aria-live="assertive">
            {submitError}
          </div>
        )}

        {renderStep()}

        <div className="step-actions">
          {showBackButton && (
            <button
              type="button"
              className="action-button"
              onClick={handleBack}
            >
              BACK
            </button>
          )}

          {showNextButton && (
            <button
              type="button"
              className="action-button"
              onClick={handleNext}
            >
              NEXT
            </button>
          )}

          {currentStep === 4 && (
            <button type="button" className="primary" onClick={resetForm}>
              Make another donation
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
