export enum UserRole {
  Client = 'Client',
  StoreManager = 'StoreManager',
  Delivery = 'Delivery',
  Admin = 'Admin',
}

export enum OrderStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Preparing = 'Preparing',
  ReadyForCollection = 'ReadyForCollection',
  Collected = 'Collected',
  InDelivery = 'InDelivery',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded',
}

export enum PaymentStatus {
  Pending = 'Pending',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Refunded = 'Refunded',
  PartialRefund = 'PartialRefund',
}

export enum PriceRange {
  Low = 'Low',
  Mid = 'Mid',
  High = 'High',
}

export enum DeliveryStatus {
  Assigned = 'Assigned',
  PickingUp = 'PickingUp',
  InTransit = 'InTransit',
  Delivered = 'Delivered',
  Failed = 'Failed',
  Returned = 'Returned',
}

export enum SubscriptionPlan {
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
  SemiAnnual = 'SemiAnnual',
  Annual = 'Annual',
}

export enum SubscriptionStatus {
  Active = 'Active',
  Paused = 'Paused',
  Cancelled = 'Cancelled',
  PastDue = 'PastDue',
}

export enum NotificationType {
  ProductAvailable = 'ProductAvailable',
  OrderUpdate = 'OrderUpdate',
  DeliveryUpdate = 'DeliveryUpdate',
  Promotion = 'Promotion',
  SubscriptionReminder = 'SubscriptionReminder',
  SurpriseBox = 'SurpriseBox',
  BulkPurchaseUpdate = 'BulkPurchaseUpdate',
}

export enum SupplierType {
  Factory = 'Factory',
  FoodIndustry = 'FoodIndustry',
  Wholesaler = 'Wholesaler',
  Producer = 'Producer',
}

export enum RequestStatus {
  Pending = 'Pending',
  UnderReview = 'UnderReview',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  Expired = 'Expired',
}
