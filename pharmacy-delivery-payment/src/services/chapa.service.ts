import axios, { AxiosInstance } from 'axios';

interface ChapaInitializePaymentData {
  amount: number;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
  customization?: {
    title?: string;
    description?: string;
    logo?: string;
  };
}

interface ChapaInitializeResponse {
  message: string;
  status: string;
  data: {
    checkout_url: string;
  };
}

interface ChapaVerifyResponse {
  message: string;
  status: string;
  data: {
    first_name: string;
    last_name: string;
    email: string;
    currency: string;
    amount: string;
    charge: string;
    mode: string;
    method: string;
    type: string;
    status: string;
    reference: string;
    tx_ref: string;
    customization: {
      title: string;
      description: string;
    };
    meta: null | any;
    created_at: string;
    updated_at: string;
  };
}

const formatErrorValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(', ');
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return 'Unknown validation error';
    return entries
      .map(([field, fieldValue]) => `${field}: ${formatErrorValue(fieldValue)}`)
      .join('; ');
  }
  return String(value);
};

const extractChapaErrorMessage = (error: any): string => {
  const data = error?.response?.data;
  const rawMessage = data?.message;
  if (typeof rawMessage === 'string' && rawMessage.trim()) {
    return rawMessage;
  }
  if (rawMessage && typeof rawMessage === 'object') {
    return formatErrorValue(rawMessage);
  }
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }
  return 'Failed to initialize payment with Chapa';
};

export class ChapaService {
  private apiKey: string;
  private baseUrl: string;
  private mode: string;
  private axiosInstance?: AxiosInstance;

  constructor() {
    this.apiKey = '';
    this.mode = 'test';
    this.baseUrl = 'https://api.chapa.co/v1';
  }

  private getClient(): AxiosInstance {
    const currentKey = process.env.CHAPA_SECRET_KEY || '';
    const currentMode = process.env.CHAPA_MODE || 'test';
    if (!currentKey) {
      throw new Error('CHAPA_SECRET_KEY is not configured. Please add it to your .env file.');
    }

    // Lazily initialize or refresh client if env changed
    if (!this.axiosInstance || this.apiKey !== currentKey) {
      this.apiKey = currentKey;
      this.mode = currentMode;
      this.axiosInstance = axios.create({
        baseURL: this.baseUrl,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
    } else {
      this.mode = currentMode;
    }

    return this.axiosInstance;
  }

  /**
   * Initialize a payment transaction with Chapa
   */
  async initializePayment(data: ChapaInitializePaymentData): Promise<ChapaInitializeResponse> {
    try {
      const client = this.getClient();
      const response = await client.post<ChapaInitializeResponse>(
        '/transaction/initialize',
        data
      );

      return response.data;
    } catch (error: any) {
      console.error('Chapa initialization error:', error.response?.data || error.message);
      throw new Error(extractChapaErrorMessage(error));
    }
  }

  /**
   * Verify a payment transaction with Chapa
   */
  async verifyPayment(txRef: string): Promise<ChapaVerifyResponse> {
    try {
      const client = this.getClient();
      const response = await client.get<ChapaVerifyResponse>(
        `/transaction/verify/${txRef}`
      );

      return response.data;
    } catch (error: any) {
      console.error('Chapa verification error:', error.response?.data || error.message);
      throw new Error(extractChapaErrorMessage(error));
    }
  }

  /**
   * Get transaction details from Chapa
   */
  async getTransaction(txRef: string): Promise<ChapaVerifyResponse> {
    return this.verifyPayment(txRef);
  }

  /**
   * Check if Chapa is properly configured
   */
  isConfigured(): boolean {
    return Boolean((process.env.CHAPA_SECRET_KEY || '').length > 0);
  }

  /**
   * Get current mode (test/live)
   */
  getMode(): string {
    return this.mode;
  }
}

// Export singleton instance
export const chapaService = new ChapaService();
