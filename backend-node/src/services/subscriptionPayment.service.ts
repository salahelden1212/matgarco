import axios from 'axios';
import Merchant from '../models/Merchant';
import Subscription, { PLANS, PlanId } from '../models/Subscription';

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY || '';
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_SUBSCRIPTION_INTEGRATION_ID || '';

interface PaymobBillingData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  city: string;
  country: string;
  state: string;
}

interface PaymentResult {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
}

class SubscriptionPaymentService {
  private baseUrl = 'https://accept.paymob.com/api';

  private async getAuthToken(): Promise<string> {
    const res = await axios.post(`${this.baseUrl}/auth/tokens`, {
      api_key: PAYMOB_API_KEY,
    });
    return res.data.token;
  }

  async createSubscriptionIntention(
    merchantId: string,
    planId: PlanId,
    billingCycle: 'monthly' | 'yearly',
  ): Promise<PaymentResult> {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) return { success: false, error: 'Merchant not found' };

    const plan = PLANS[planId];
    if (!plan) return { success: false, error: 'Invalid plan' };

    const amount = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
    const amountCents = Math.round(amount * 100);

    const merchantName = merchant.storeName || merchant.email || 'Merchant';
    const nameParts = merchantName.split(' ');
    const billingData: PaymobBillingData = {
      first_name: nameParts[0] || merchantName,
      last_name: nameParts.slice(1).join(' ') || 'N/A',
      email: merchant.email || '',
      phone_number: merchant.phone || '0000000000',
      street: 'N/A',
      building: 'N/A',
      floor: 'N/A',
      apartment: 'N/A',
      city: 'Cairo',
      country: 'EG',
      state: 'Cairo',
    };

    try {
      const token = await this.getAuthToken();

      const orderRes = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
        auth_token: token,
        delivery_needed: false,
        amount_cents: amountCents,
        currency: 'EGP',
        merchant_id: merchantId,
        items: [],
      });

      const paymentKeyRes = await axios.post(
        `${this.baseUrl}/acceptance/payment_keys`,
        {
          auth_token: token,
          amount_cents: amountCents,
          expiration: 3600,
          order_id: orderRes.data.id,
          billing_data: billingData,
          currency: 'EGP',
          integration_id: PAYMOB_INTEGRATION_ID,
          lock_order_when_paid: true,
        },
      );

      const paymentKey = paymentKeyRes.data.token;
      const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_INTEGRATION_ID}?payment_token=${paymentKey}`;

      return {
        success: true,
        paymentUrl,
        transactionId: String(orderRes.data.id),
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.response?.data?.message || err.message,
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<{ verified: boolean; amount?: number }> {
    try {
      const token = await this.getAuthToken();
      const res = await axios.get(
        `${this.baseUrl}/acceptance/transactions/${transactionId}`,
        { params: { auth_token: token } },
      );

      const tx = res.data;
      return {
        verified: tx.success === true && tx.pending === false,
        amount: tx.amount_cents ? tx.amount_cents / 100 : undefined,
      };
    } catch {
      return { verified: false };
    }
  }
}

export const subscriptionPaymentService = new SubscriptionPaymentService();
