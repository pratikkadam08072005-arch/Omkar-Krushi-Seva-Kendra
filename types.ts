
export enum View {
  DASHBOARD = 'DASHBOARD',
  MARKET = 'MARKET',
  CROP_DIAGNOSIS = 'CROP_DIAGNOSIS',
  VOICE_ASSISTANT = 'VOICE_ASSISTANT',
  COMMODITY_PRICES = 'COMMODITY_PRICES',
  PROFILE = 'PROFILE',
  ADMIN_PANEL = 'ADMIN_PANEL'
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum Language {
  EN = 'en',
  HI = 'hi',
  MR = 'mr'
}

export interface UserProfile {
  name: string;
  email: string;
  mobileNumber: string;
  location: string;
  village: string;
  city: string;
  district: string;
  state: string;
  permanentAddress: string;
  otherAddress: string;
  preferredCrops: string;
  profilePic?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  description: string;
  stock: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  village: string;
  district: string;
  state: string;
  city: string;
  permanentAddress: string;
  date: string;
  total: string;
  status: 'Pending' | 'Dispatched' | 'Delivered' | 'Cancelled';
  items: string[];
  preferredCrops?: string;
}

export interface MarketPrice {
  commodity: string;
  location: string;
  price: string;
  trend: 'up' | 'down' | 'stable';
}
