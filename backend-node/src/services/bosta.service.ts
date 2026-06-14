import axios, { AxiosInstance } from 'axios';

interface RateRequest {
  originCity: string;
  destinationCity: string;
  weightKg: number;
  codAmount?: number;
}

interface RateResponse {
  provider: string;
  serviceName: string;
  estimatedCost: number;
  estimatedDelivery: string;
  currency: string;
}

interface CreateShipmentParams {
  apiKey: string;
  originCity: string;
  destinationCity: string;
  destinationAddress: string;
  recipientName: string;
  recipientPhone: string;
  weightKg: number;
  description: string;
  codAmount?: number;
}

interface ShipmentResult {
  trackingNumber: string;
  labelUrl: string;
  estimatedDelivery: string;
}

interface TrackingEvent {
  status: string;
  timestamp: string;
  location?: string;
  description?: string;
}

interface TrackingResult {
  trackingNumber: string;
  currentStatus: string;
  events: TrackingEvent[];
  estimatedDelivery?: string;
}

class BostaService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://api.bosta.co/v2';
  }

  private getClient(apiKey: string): AxiosInstance {
    return axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      timeout: 15000,
    });
  }

  async calculateRate(params: RateRequest): Promise<RateResponse> {
    const response = await axios.get(`${this.baseUrl}/rates`, {
      params: {
        'origin[city]': params.originCity,
        'destination[city]': params.destinationCity,
        'parcel[weight]': params.weightKg,
        ...(params.codAmount ? { 'cod[amount]': params.codAmount } : {}),
      },
    });

    const rate = response.data?.data?.[0] || response.data?.[0];
    return {
      provider: 'bosta',
      serviceName: rate?.name || 'Express',
      estimatedCost: rate?.price || 0,
      estimatedDelivery: rate?.expectedDelivery || '2-4 أيام عمل',
      currency: 'EGP',
    };
  }

  async createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    const client = this.getClient(params.apiKey);
    const payload = {
      type: 10,
      firstName: params.recipientName.split(' ')[0],
      lastName: params.recipientName.split(' ').slice(1).join(' ') || 'N/A',
      phone: params.recipientPhone,
      email: '',
      street: params.destinationAddress,
      city: params.destinationCity,
      parcelWeight: params.weightKg,
      description: params.description,
      ...(params.codAmount ? { cod: params.codAmount } : {}),
    };

    const response = await client.post('/shipments', payload);
    const data = response.data?.data || response.data;

    return {
      trackingNumber: data?.trackingNumber || data?._id,
      labelUrl: data?.label?.url || data?.labelUrl || '',
      estimatedDelivery: data?.expectedDelivery || '2-4 أيام عمل',
    };
  }

  async trackShipment(apiKey: string, trackingNumber: string): Promise<TrackingResult> {
    const client = this.getClient(apiKey);
    const response = await client.get(`/shipments/${trackingNumber}/track`);
    const data = response.data?.data || response.data;

    const events: TrackingEvent[] = (data?.events || []).map((ev: any) => ({
      status: ev.state || ev.status,
      timestamp: ev.date || ev.timestamp,
      location: ev.location,
      description: ev.reason || ev.description,
    }));

    return {
      trackingNumber,
      currentStatus: data?.state || events[events.length - 1]?.status || 'unknown',
      events,
      estimatedDelivery: data?.expectedDelivery,
    };
  }
}

export const bostaService = new BostaService();
