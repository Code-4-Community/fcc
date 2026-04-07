import axios, { type AxiosInstance } from 'axios';

const defaultBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export type DonationCreateRequest = {
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  isAnonymous: boolean;
  donationType: 'one_time' | 'recurring';
  dedicationMessage: string;
  showDedicationPublicly: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'yearly';
  paymentIntentId?: string;
};

export type CreateDonationResponse = { id: string };

export type CreatePaymentIntentRequest = {
  amount: number; // in cents
  currency: string;
  metadata?: Record<string, unknown>;
};

export type PaymentIntentResponse = {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
};

type ApiError = { error?: string; message?: string };

export class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({ baseURL: defaultBaseUrl });
  }

  public async getHello(): Promise<string> {
    const res = await this.axiosInstance.get<string>('/api');
    return res.data;
  }

  public async createPaymentIntent(
    body: CreatePaymentIntentRequest,
  ): Promise<PaymentIntentResponse> {
    try {
      const res = await this.axiosInstance.post('/api/payments/intent', body);
      return res.data as PaymentIntentResponse;
    } catch (err: unknown) {
      if (axios.isAxiosError<ApiError>(err)) {
        const data = err.response?.data;
        const msg =
          data?.error ??
          data?.message ??
          err.message ??
          'Failed to create payment intent';
        throw new Error(msg);
      }
      throw new Error('Failed to create payment intent');
    }
  }

  public async createDonation(
    body: DonationCreateRequest,
  ): Promise<CreateDonationResponse> {
    try {
      const res = await this.axiosInstance.post('/api/donations', body);
      return res.data as CreateDonationResponse;
    } catch (err: unknown) {
      if (axios.isAxiosError<ApiError>(err)) {
        const data = err.response?.data;
        const msg =
          data?.error ??
          data?.message ??
          err.message ??
          'Failed to create donation';
        throw new Error(msg);
      }
      throw new Error('Failed to create donation');
    }
  }

  private async get(path: string): Promise<unknown> {
    return this.axiosInstance.get(path).then((response) => response.data);
  }

  private async post(path: string, body: unknown): Promise<unknown> {
    return this.axiosInstance
      .post(path, body)
      .then((response) => response.data);
  }

  private async patch(path: string, body: unknown): Promise<unknown> {
    return this.axiosInstance
      .patch(path, body)
      .then((response) => response.data);
  }

  private async delete(path: string): Promise<unknown> {
    return this.axiosInstance.delete(path).then((response) => response.data);
  }
}

export default new ApiClient();

export type { DonationCreateRequest as CreateDonationRequest };
