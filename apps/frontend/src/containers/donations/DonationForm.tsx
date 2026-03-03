import apiClient, {
  type CreateDonationResponse,
  type CreateDonationRequest,
} from '../../api/apiClient';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { Button } from '@components/ui/button';

export const DonationForm: React.FC<DonationFormProps> = ({
  onSuccess,
  onError,
  onAmountChange,
}) => {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<DonationStep>(() => {
    const stepParam = searchParams.get('step');
    if (stepParam === '4') return 4;
    return 1;
  });
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
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    coverFees: false,
  });

  const [errors, setErrors] = useState<Partial<FormErrors>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(
    searchParams.get('receiptId'),
  );

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

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
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
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
      coverFees: false,
    });
    setErrors({});
    setReceiptId(null);
    setSubmitError(null);
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const step1Valid = validateStep(1);

    if (!step1Valid) {
      setCurrentStep(1);
      return;
    }

    const step2Valid = validateStep(2);
    if (!step2Valid) {
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

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
      setSubmitError(err.message || 'Failed to submit donation');
      onError(err);
    } finally {
      setIsSubmitting(false);
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
          <Step2Details
            formData={formData}
            errors={errors}
            isSubmitting={isSubmitting}
            onChange={handleInputChange}
          />
        );
      case 3:
        return <Step3Confirm formData={formData} />;
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
        className="donation-form flex flex-col p-[5%] box-border min-h-fit"
        onSubmit={(e) => e.preventDefault()}
        noValidate
      >
        <div
          className={`flex w-full flex-row justify-center items-center gap-[3%] mb-[8%] ${currentStep === 1 || currentStep === 3 ? 'font-sans' : ''}`}
        >
          <div
            className={`w-[31%] aspect-[14/1] rounded-[10px] ${
              currentStep === 1 ? 'bg-[#650d77]' : 'bg-[#b3b3b3]'
            }`}
          ></div>
          <div
            className={`w-[31%] aspect-[14/1] rounded-[10px] ${
              currentStep === 2 ? 'bg-[#650d77]' : 'bg-[#b3b3b3]'
            }`}
          ></div>
          <div
            className={`w-[31%] aspect-[14/1] rounded-[10px] ${
              currentStep === 3 ? 'bg-[#650d77]' : 'bg-[#b3b3b3]'
            }`}
          ></div>
        </div>
        {submitError && (
          <div className="error-banner" role="alert" aria-live="assertive">
            {submitError}
          </div>
        )}

        {renderStep()}

        <div
          className={`flex flex-row items-center justify-center w-full gap-[7%] pt-6 mt-auto ${currentStep === 1 || currentStep === 3 ? 'font-sans' : ''}`}
        >
          {showBackButton && (
            <Button
              variant="unstyled"
              type="button"
              className="flex-1 rounded-[2cqh] border-[3px] border-[#007b64] bg-white text-[#007b64] font-semibold h-[2.5rem] flex justify-center items-center text-center text-[2.5cqh] hover:bg-[#f0fffb]"
              onClick={handleBack}
            >
              Back
            </Button>
          )}

          {showNextButton && (
            <Button
              variant="unstyled"
              type="button"
              className="flex-1 rounded-[2cqh] bg-[#007b64] text-white font-semibold h-[2.5rem] flex justify-center items-center text-center text-[2.5cqh] hover:bg-[#006b54]"
              onClick={handleNext}
            >
              Next
            </Button>
          )}

          {currentStep === 3 && (
            <Button
              variant="unstyled"
              type="button"
              className="flex-1 rounded-[4px] bg-[#007b64] hover:bg-[#006b54] text-white h-[2.5rem] px-3 text-base font-semibold disabled:bg-[#aaa]"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Donate'}
            </Button>
          )}

          {currentStep === 4 && (
            <Button
              variant="default"
              type="button"
              className="primary font-semibold"
              onClick={resetForm}
            >
              Make another donation
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
