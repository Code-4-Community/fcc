import axios, { type AxiosInstance } from 'axios';

const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export type DonationCreateRequest = {
  firstName: string;
  lastName: string;
  email: string;
  amount: number; // parsed to number in the form
  isAnonymous: boolean;
  donationType: 'one_time' | 'recurring';
  dedicationMessage: string; // allow '' from ui
  showDedicationPublicly: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'yearly';
};

export type CreateDonationResponse = { id: string };
export type DonationStatsResponse = {
  total: number;
  count: number;
  yearToDate: number;
  monthToDate: number;
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

type ApiError = { error?: string; message?: string };

export class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({ baseURL: defaultBaseUrl });
  }

  public async getHello(): Promise<string> {
    //return this.get('/api') as Promise<string>;
    const res = await this.axiosInstance.get<string>('/api');
    return res.data;
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

  public async getDonations(params?: {
    page?: number;
    perPage?: number;
    donationType?: 'one_time' | 'recurring';
    status?: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  }): Promise<{
    rows: Array<{
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      amount: number;
      donationType: 'one_time' | 'recurring';
      status: string;
      createdAt: string;
    }>;
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  }> {
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
