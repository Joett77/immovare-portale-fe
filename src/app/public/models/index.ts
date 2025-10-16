import { Type } from '@angular/core';

export interface Post {
  id: number;
  author: string;
  tags: string[];
  title: string;
  content: string;
  image?: {
    url?: string;
  };
}

export interface Guide {
  id: number;
  title: string;
  description: string;
  image: {
    url: string;
  };
  file: {
    url: string;
  };
}

export interface TPropertyAddressForm {
  street: string;
  street_number: number;
  zip_code: number;
  city: string;
  country: string;
}

export interface PropertyFeature {
  id: number;
  label: string;
  icon?: Type<any>;
  key?: string;
}

export interface PropertyBuy {
  propertyAddress?: string;
  number_rooms?: number[];
  square_metres?: number[];
  price?: number[];
  category?: 'residenziale' | 'commerciale'; // Add more categories if needed
  property_type?:
    | 'Villa'
    | 'Appartamento'
    | 'Mansarda'
    | 'Attico'
    | 'Villetta a schiera'
    | 'Loft/Open space';
  type?:
    | 'Villa'
    | 'Appartamento'
    | 'Mansarda'
    | 'Attico'
    | 'Villetta a schiera'
    | 'Loft/Open space'; // Extend with all possible types
  property_status?:
    | 'Qualsiasi'
    | 'Abitabile'
    | 'Ristrutturato'
    | 'Da ristrutturare'
    | 'Nuova costruzione';
  property_heating?: 'Qualsiasi' | 'Autonomo' | 'Centralizzato' | 'Nessuno';
  yearOfConstruction?: string[]; // Using ISO date strings
  property_floor?: 'Qualsiasi' | 'Seminterrato' | 'Piano terra' | 'Piani intermedi' | 'Piano primo'; // Add other floors if needed
  numberOfBathrooms?: number;
  property_extraFeatures?: (
    | 'Balcone'
    | 'Piscina'
    | 'Garage'
    | 'Ascensore'
    | 'Giardino'
    | 'Parcheggio'
    | 'Licenza turistica'
  )[];
  bbox?: {
    lat_max: number;
    lat_min: number;
    long_max: number;
    long_min: number;
  };
  polygon_coordinates?: [number, number][];
}

export interface FavoriteProperties {
  id: number;
  details_1: string;
  location_1: string;
  subtle: string;
  rooms_1: number;
  type_1: string;
  size: string;
  bathrooms: number;
  price_1: string;
  image_1: string;
}

export interface PropertyEvaluation {
  address?: any;
  features?: any;
  extraFeatures?: any;
  price?: any;
  fileUploads?: any;
  floorplan?: any;
  [key: string]: any;
}

export interface RadioButtonOption {
  label: string;
  value: string;
}

export type City = {
  id: number;
  label: string;
  icon: Type<any>;
};

export interface FAQItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

export type SavedSearches = {
  id: number;
  location: string;
  details: string;
  rooms: number;
  area: number;
  type: string;
  price: string;
  image: string;
  ricerche_salvate?: Property[];
};

export type NotLoggedSection = {
  titleSection:
    | string
    | 'Iscriviti per salvare le ricerche effettuate'
    | 'Iscriviti per salvare gli immobili preferiti'
    | 'Nessuna ricerca salvata'
    | 'Nessun immobile aggiunto ai preferiti.';
  emptySubTitle?:
    | 'Qui troverai le ricerche che hai salvato.'
    | 'Qui troverai gli immobili che hai aggiunto ai preferiti.';
  bulletPoints: string[];
  button: boolean;
};

export interface ExtraFeatures {
  Balcony?: boolean;
  Terrace?: boolean;
  Garden?: boolean;
  Parking?: boolean;
  Garage?: boolean;
  Pool?: boolean;
  TouristLicense?: boolean;
}

export interface GeoFeature {
  type: string;
  properties: {
    place_id?: string;
    category?: string;
    address?: {
      road: string;
      house_number: string;
      postcode: string;
      city: string | null;
      town: string | null;
      village: string | null;
      country: string | null;
      state?: string | null;
    };
    name?: string;
    display_name: string;
    type: string;
    extratags?: {
      place?: string;
    };
    structured_formatting?: any;
  };
  geometry: {
    type: string;
    coordinates: number[];
  };
  bbox?: number[];
}

export interface Property {
  id?: number;
  searchId?: number;
  city?: string;
  district?: string;
  region?: string;
  country?: string;
  house_number?: string;
  zip_code?: string;
  category?: string;
  type?: string;
  square_metres?: number[];
  number_rooms?: number[];
  number_baths?: number[];
  floor?: string;
  property_condition?: string;
  utils?: string;
  heating?: string;
  energy_class?: string;
  features?: string;
  services?: string;
  description?: string;
  price?: number[];
  price_formatted?: string;
  creation?: string;
  publication?: string;
  last_update?: string;
  buyer?: null;
  ad_status?: string;
  document?: null;
  evaluation_agent?: null;
  created_at?: string;
  updated_at?: string;
  created_by_id?: number | null;
  updated_by_id?: number | null;
  latitude?: number;
  longitude?: number;
  address?: string;
  total_count?: string;
  images?: any;
  status?: string;
  polygon_coordinates?: [number, number][];
  zoom?: number;
  url?: string;
  bbox?: {
    lat_max: number;
    lat_min: number;
    long_max: number;
    long_min: number;
  };
  selectedAddress?: string;
  formattedAddress?: string;

  // Added missing properties
  yearOfConstruction?: number[];
  property_extraFeatures?: string;
  property_status?: string;
  property_heating?: string;
  property_floor?: string;
}

export interface PropertyListResponse {
  data: AdvertisementDraft[];
  meta: {
    page: number;
    pageCount: number;
    total: number;
    pageSize: number;
  };
}

export interface AdvertisementDraft {
  title?: string;
  id: string | null;
  address?: string;
  visitCount?: number;
  houseNumber?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  type?: string;
  squareMetres?: number;
  numberRooms?: number;
  numberBaths?: number;
  floor?: number | string;
  propertyCondition?: string;
  heating?: string;
  energyClass?: string;
  description?: string;
  features?: string;
  price?: number;
  services?: string;
  draftStep: number;
  draftPlanSelected?: string;
  adStatus: string;
  yearOfConstruction?: number;
  deed_state?: string;
  createdByKeycloakUser?: string | null;
  virtualTourFrameUrl?: string;
  // Add these date-related fields
  creation?: string | Date;
  publication?: string | Date;
  lastUpdate?: string | Date;
  region?: string;
  // Keep image-related fields
  images?: Array<{
    id: number;
    name: string;
    url: string;
    mime: string;
    formats?: any;
    hash?: string;
    ext?: string;
    size?: number;
    width?: number;
    height?: number;
  }>;
  floorplan?: Array<{
    id: number;
    name: string;
    url: string;
    mime: string;
  }>;
  photoIds?: string[];
  floorPlanIds?: string[];
  agentKeycloakUser?: string;
  lastActiveSubscription?: string;
  lastActiveSubscriptionId?: string;
  condoFees?: number;
  constructionYear?: number;
  deedState?: string;
  floorNumber?: number;
  requestCount?: number;
  appointmentCount?: number;
  bpmId?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Error types
export enum ApiErrorType {
  AUTHENTICATION = 'auth_error',
  NETWORK = 'network_error',
  SERVER = 'server_error',
  VALIDATION = 'validation_error',
  UNKNOWN = 'unknown_error',
}

export interface ApiError {
  type: ApiErrorType;
  message: string;
  status?: number;
  details?: any;
}
