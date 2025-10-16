export interface Plan {
  id?: string;
  title: string;
  description: string;
  interval: number;
  price: number;
  priceDescription: string;
  isService: boolean;
  serviceList?: { name: string; description: string; type: string }[];
  creationDate?: string;
  stripeProductId?: string;
  tag?: string;
  stripePriceId?: string;
  status?: string;
  free?: boolean;
  createdAt?: string;
}
