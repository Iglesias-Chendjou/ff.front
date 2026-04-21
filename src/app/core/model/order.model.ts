import { OrderStatus, PaymentStatus, PriceRange } from './enums';

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  deliveryAddressId: string;
  status: OrderStatus;
  subTotal: number;
  deliveryFee: number;
  totalAmount: number;
  tva: number;
  isSubscriptionOrder: boolean;
  notes?: string;
  createdAt: string;
  paidAt?: string;
  preparedAt?: string;
  collectedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  items?: OrderItem[];
  payment?: Payment;
  delivery?: Delivery;
}

export interface OrderItem {
  id: string;
  orderId: string;
  storeInventoryId: string;
  productName: string;
  priceRange: PriceRange;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  storeId: string;
}

export interface Payment {
  id: string;
  orderId: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  bancontactUsed: boolean;
  createdAt: string;
  confirmedAt?: string;
}

export interface CreateOrderRequest {
  deliveryAddressId: string;
  items: { storeInventoryId: string; quantity: number }[];
  notes?: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  deliveryPersonId: string;
  zoneId: string;
  status: string;
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  clientRating?: number;
  clientComment?: string;
}

