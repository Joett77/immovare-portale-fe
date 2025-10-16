// src/app/public/models/ticket.models.ts

export interface TicketAttachment {
  id: number;
  name: string;
  url: string;
  mime: string;
  size: number;
  ext: string;
}

export interface TicketThread {
  id: number;
  message: string;
  createdByKeycloakUser: string;
  isInternal: boolean;
  threadType: 'USER_MESSAGE' | 'AGENT_RESPONSE' | 'SYSTEM_MESSAGE' | 'STATUS_UPDATE';
  creationDate: string;
  attachments?: TicketAttachment[];
  readBy: string[];
}

export interface Ticket {
  id: number;
  subject: string;
  description: string;
  ticketStatus: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category:
    | 'TECHNICAL_SUPPORT'
    | 'BILLING'
    | 'PROPERTY_INQUIRY'
    | 'ACCOUNT_ISSUE'
    | 'FEATURE_REQUEST'
    | 'BUG_REPORT'
    | 'OTHER';
  creationDate: string;
  lastUpdate: string;
  closedDate?: string;
  createdByKeycloakUser: string;
  assignedToKeycloakUser?: string;
  advertisement?: {
    id: number;
    title: string;
    city: string;
    address: string;
  };
  attachments?: TicketAttachment[];
  threads?: TicketThread[];
  tags: string[];
  internalNotes?: string;
  customerSatisfactionRating?: number;
  resolutionTime?: number;
}

export interface CreateTicketData {
  subject: string;
  description: string;
  category: string;
  priority?: string;
  advertisementId?: number;
  attachments?: File[];
}

export interface CreateThreadData {
  message: string;
  threadType?: string;
  attachments?: File[];
  newTicketStatus?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  waitingCustomer: number;
  resolved: number;
  closed: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  averageResolutionTime: number;
}
