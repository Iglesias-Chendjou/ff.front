import { PriceRange } from './enums';

export interface ProductCategory {
  id: string;
  name: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface AvailableProduct {
  storeInventoryId: string;
  productTemplateId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  unit: string;
  categoryName: string;
  priceRange: PriceRange;
  originalPrice: number;
  discountedPrice: number;
  availableQuantity: number;
  expirationDate: string;
  storeId: string;
  storeName: string;
}

export interface ProductTemplate {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  unit: string;
  priceLowRange: number;
  priceMidRange: number;
  priceHighRange: number;
  discountPercent: number;
  isActive: boolean;
  category?: ProductCategory;
}

export interface StoreInventory {
  id: string;
  storeId: string;
  productTemplateId: string;
  selectedRange: PriceRange;
  quantity: number;
  availableQuantity: number;
  expirationDate: string;
  checkedAt: string;
  isPublished: boolean;
  productTemplate?: ProductTemplate;
  store?: Store;
}

export interface Store {
  id: string;
  name: string;
  brand: string;
  address: string;
  postalCode: string;
  city: string;
  commune: string;
  latitude: number;
  longitude: number;
  phone: string;
  zoneId: string;
  isActive: boolean;
}

export interface Zone {
  id: string;
  name: string;
  communes: string[];
  maxDeliveryMinutes: number;
  isActive: boolean;
}
