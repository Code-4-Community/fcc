import axios, { type AxiosInstance } from 'axios';

const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export type DonationCreateRequest = {
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  isAnonymous: boolean;
  donationType: 'one_time' | 'recurring';
  dedicationMessage: string;
  showDedicationPublicly: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'annually';
  paymentIntentId?: string;
};

export type CreateDonationResponse = { id: string };
export type DonationStatsResponse = {
  total: number;
  count: number;
  yearToDate: number;
  monthToDate: number;
};

export type DonationListRow = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  donationType: 'one_time' | 'recurring';
  recurringInterval?:
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'bimonthly'
    | 'quarterly'
    | 'annually';
  dedicationMessage?: string;
  showDedicationPublicly: boolean;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  transactionId?: string;
  isAnonymous: boolean;
};

export type PublicDonationRow = {
  id: number;
  donorName?: string;
  amount: number;
  isAnonymous: boolean;
  donationType: 'one_time' | 'recurring';
  recurringInterval?: 'weekly' | 'monthly' | 'yearly' | 'annually';
  dedicationMessage?: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  createdAt: string;
};

export type DonationListResponse = {
  rows: DonationListRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type ActiveGoalResponse = {
  goal: {
    id: number;
    title: string;
    targetAmount: number;
    startDate: string;
    endDate: string;
    dateRangeLabel: string;
  } | null;
  amountRaised: number;
  progressPercent: number;
};

export type UpdateGoalRequest = {
  title?: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
};

export type SaveTemplateRequest = {
  type: 'donation_response' | 'relapsed_donor' | 'email_subscribers';
  subject: string;
  bodyHtml: string;
};

export type SaveTemplateResponse = {
  message: string;
  template: {
    id: number;
    type: string;
    subject: string;
    updatedAt: string;
  };
};

export type BulkSendRequest = {
  targetGroup: 'relapsed_donors' | 'email_subscribers';
  subject: string;
  bodyHtml: string;
};

export type BulkSendResponse = {
  message: string;
  sent: number;
  targetGroup: string;
};

export type EmailSubscribersResponse = {
  emails: string[];
  count: number;
};

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

export type SignInRequest = { email: string; password: string };

export type SignUpRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
};

export type RefreshRequest = { refreshToken: string; userSub: string };
export type ConfirmPasswordRequest = {
  email: string;
  confirmationCode: string;
  newPassword: string;
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

  public async syncPaymentIntent(intentId: string): Promise<void> {
    try {
      await this.axiosInstance.post(`/api/payments/intent/${intentId}/sync`);
    } catch (err: unknown) {
      this.handleAxiosError(err, 'Failed to sync payment intent');
    }
  }

  public setAuthToken(token: string | null) {
    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] =
        `Bearer ${token}`;
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  public async signin(body: SignInRequest): Promise<AuthResponse> {
    try {
      const res = await this.axiosInstance.post('/api/auth/signin', body);
      return res.data as AuthResponse;
    } catch (err: unknown) {
      this.handleAxiosError(err, 'Failed to sign in');
    }
  }

  public async signup(body: SignUpRequest): Promise<unknown> {
    try {
      const res = await this.axiosInstance.post('/api/auth/signup', body);
      return res.data;
    } catch (err: unknown) {
      this.handleAxiosError(err, 'Failed to sign up');
    }
  }

  public async refresh(body: RefreshRequest): Promise<AuthResponse> {
    try {
      const res = await this.axiosInstance.post('/api/auth/refresh', body);
      return res.data as AuthResponse;
    } catch (err: unknown) {
      this.handleAxiosError(err, 'Failed to refresh token');
    }
  }

  public async forgotPassword(email: string): Promise<void> {
    try {
      await this.axiosInstance.post('/api/auth/forgotPassword', { email });
    } catch (err: unknown) {
      this.handleAxiosError(err, 'Failed to send password reset email');
    }
  }

  public async confirmPassword(body: ConfirmPasswordRequest): Promise<void> {
    try {
      await this.axiosInstance.post('/api/auth/confirmPassword', body);
    } catch (err: unknown) {
      this.handleAxiosError(err, 'Failed to reset password');
    }
  }

  public async getActiveGoalSummary(): Promise<ActiveGoalResponse> {
    try {
      const res = await this.axiosInstance.get('/api/donations/goal/active');
      return res.data;
    } catch (err: unknown) {
      this.handleAxiosError(err, 'Failed to fetch active goal');
    }
  }

  public async updateGoal(
    id: number | null,
    body: UpdateGoalRequest,
  ): Promise<void> {
    try {
      const url = id ? `/api/donations/goal/${id}` : '/api/donations/goal';
      await this.axiosInstance.patch(url, body);
    } catch (err: unknown) {
      this.handleAxiosError(err, 'Failed to update goal');
    }
  }

  private handleAxiosError(err: unknown, defaultMsg: string): never {
    if (axios.isAxiosError<ApiError>(err)) {
      const data = err.response?.data;
      const msg = data?.message ?? data?.error ?? err.message ?? defaultMsg;
      throw new Error(msg);
    }
    throw new Error(defaultMsg);
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

  public async getPublicDonations(params?: {
    limit?: number;
  }): Promise<PublicDonationRow[]> {
    try {
      const res = await this.axiosInstance.get('/api/donations/public', {
        params,
      });
      return res.data;
    } catch (err: unknown) {
      this.handleAxiosError(err, 'Failed to fetch public donations');
    }
  }

  public async getDonations(params?: {
    page?: number;
    perPage?: number;
    donationType?: 'one_time' | 'recurring';
    status?: 'pending' | 'succeeded' | 'failed' | 'cancelled';
    startDate?: string;
    endDate?: string;
  }): Promise<DonationListResponse> {
    try {
      const res = await this.axiosInstance.get('/api/donations', {
        params,
      });
      return res.data;
    } catch (err: unknown) {
      this.handleAxiosError(err, 'Failed to fetch donations');
    }
  }

  public async getDonationStats(): Promise<DonationStatsResponse> {
    try {
      const res = await this.axiosInstance.get('/api/donations/stats');
      return res.data as DonationStatsResponse;
    } catch (err: unknown) {
      this.handleAxiosError(err, 'Failed to fetch donation stats');
    }
  }

  public async exportDonationsCsv(): Promise<Blob> {
    try {
      const res = await this.axiosInstance.get('/api/donations/export', {
        responseType: 'blob',
      });
      return res.data as Blob;
    } catch (err: unknown) {
      this.handleAxiosError(err, 'Failed to export donations');
    }
  }

  public async updateUserStatus(
    id: number,
    status: 'ADMIN' | 'STANDARD',
  ): Promise<void> {
    try {
      await this.axiosInstance.patch(`/api/users/${id}/status`, { status });
    } catch (err: unknown) {
      this.handleAxiosError(err, 'Failed to update user status');
    }
  }

  public async saveEmailTemplate(
    body: SaveTemplateRequest,
  ): Promise<SaveTemplateResponse> {
    try {
      const res = await this.axiosInstance.post('/api/emails/template', body);
      return res.data as SaveTemplateResponse;
    } catch (err: unknown) {
      this.handleAxiosError(err, 'Failed to save email template');
    }
  }

  public async bulkSendEmail(body: BulkSendRequest): Promise<BulkSendResponse> {
    try {
      const res = await this.axiosInstance.post('/api/emails/bulk-send', body);
      return res.data as BulkSendResponse;
    } catch (err: unknown) {
      this.handleAxiosError(err, 'Failed to send bulk email');
    }
  }

  public async getEmailSubscribers(): Promise<EmailSubscribersResponse> {
    try {
      const res = await this.axiosInstance.get('/api/emails/subscribers');
      return res.data as EmailSubscribersResponse;
    } catch (err: unknown) {
      this.handleAxiosError(err, 'Failed to fetch email subscribers');
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
