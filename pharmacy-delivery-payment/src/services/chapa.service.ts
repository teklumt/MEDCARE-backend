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

export class ChapaService {
  private apiKey: string;
  private baseUrl: string;
  private mode: string;
  private axiosInstance?: AxiosInstance;

  constructor() {
    this.apiKey = process.env.CHAPA_SECRET_KEY || '';
    this.mode = process.env.CHAPA_MODE || 'test';
    this.baseUrl = 'https://api.chapa.co/v1';

    // Don't throw error in constructor, check when methods are called
    if (this.apiKey) {
      this.axiosInstance = axios.create({
        baseURL: this.baseUrl,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds
      });
    }
  }

  /**
   * Initialize a payment transaction with Chapa
   */
  async initializePayment(data: ChapaInitializePaymentData): Promise<ChapaInitializeResponse> {
    if (!this.apiKey || !this.axiosInstance) {
      throw new Error('CHAPA_SECRET_KEY is not configured. Please add it to your .env file.');
    }

    try {
      const response = await this.axiosInstance.post<ChapaInitializeResponse>(
        '/transaction/initialize',
        data
      );

      return response.data;
    } catch (error: any) {
      console.error('Chapa initialization error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 
        'Failed to initialize payment with Chapa'
      );
    }
  }

  /**
   * Verify a payment transaction with Chapa
   */
  async verifyPayment(txRef: string): Promise<ChapaVerifyResponse> {
    if (!this.apiKey || !this.axiosInstance) {
      throw new Error('CHAPA_SECRET_KEY is not configured. Please add it to your .env file.');
    }

    try {
      const response = await this.axiosInstance.get<ChapaVerifyResponse>(
        `/transaction/verify/${txRef}`
      );

      return response.data;
    } catch (error: any) {
      console.error('Chapa verification error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 
        'Failed to verify payment with Chapa'
      );
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
    return Boolean(this.apiKey && this.apiKey.length > 0);
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
