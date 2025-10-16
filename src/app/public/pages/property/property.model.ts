export interface PropertyImage {
  id: number;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    large: ImageFormat;
    small: ImageFormat;
    medium: ImageFormat;
    thumbnail: ImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any;
  folderPath: string;
  createdAt: string;
  updatedAt: string;
}

interface ImageFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

export interface Property {
  id: number;
  city: string;
  district: string;
  houseNumber: string;
  zipCode: string;
  category: string;
  type: string;
  squareMetres: number;
  numberRooms: number;
  numberBaths: number;
  floor: string;
  propertyCondition: string;
  utils: string;
  heating: string;
  energyClass: string;
  features: string;
  services: string;
  description: string;
  price: number;
  creation: string;
  publication: string;
  lastUpdate: string;
  buyer: any;
  adStatus: string;
  document: any;
  evaluationAgent: any;
  createdAt: string;
  updatedAt: string;
  latitude: number;
  longitude: number;
  address: string;
  region: string | null;
  country: string | null;
  ticket_assistances: any[];
  plan: any[];
  author: any;
  agent: any[];
  images: PropertyImage[];
  visitCount?: number;
  floorplan?: PropertyImage[];
  virtualTourFrameUrl?: string;
  agentKeycloakUser?: string;
  agentData?: any;
  constructionYear?: number;
  deedState?: string;
  floorNumber?: number;
  requestCount?: number;
  appointmentCount?: number;
}
