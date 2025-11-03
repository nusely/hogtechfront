import { loadPaystack } from '@/lib/paystack';
import toast from 'react-hot-toast';

export interface PaymentData {
  email: string;
  amount: number; // Amount in pesewas (GHS * 100)
  reference: string;
  metadata?: {
    order_id?: string;
    user_id?: string;
    [key: string]: any;
  };
}

export interface PaymentResponse {
  success: boolean;
  reference?: string;
  authorization_url?: string;
  access_code?: string;
  message?: string;
}

export const paymentService = {
  // Initialize Paystack payment
  async initializePayment(data: PaymentData): Promise<PaymentResponse> {
    try {
      const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
      
      if (!publicKey) {
        throw new Error('Paystack public key is not configured');
      }

      const PaystackPop = await loadPaystack();
      
      // Create payment handler
      const handler = PaystackPop.setup({
        key: publicKey,
        email: data.email,
        amount: data.amount,
        ref: data.reference,
        metadata: data.metadata || {},
        currency: 'GHS',
        callback: (response: any) => {
          // This callback is called after payment
          if (typeof window !== 'undefined') {
            const orderId = sessionStorage.getItem('pending_order_id');
            if (orderId) {
              window.location.href = `/orders/${orderId}?payment=success&reference=${response.reference}`;
            }
          }
        },
        onClose: () => {
          // User closed payment modal
          toast.error('Payment cancelled');
        },
      });

      // Open Paystack payment modal
      handler.openIframe();

      return {
        success: true,
        reference: data.reference,
      };
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      return {
        success: false,
        message: error.message || 'Failed to initialize payment',
      };
    }
  },

  // Verify payment (for callback after payment)
  async verifyPayment(reference: string): Promise<PaymentResponse> {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: error.message || 'Failed to verify payment',
      };
    }
  },
};

