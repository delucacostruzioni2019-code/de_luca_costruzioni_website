export type LeadType = 'contact' | 'supplier' | 'free_estimate';

export type LeadStatus =
  | 'nuovo'
  | 'contattato'
  | 'sopralluogo_fissato'
  | 'in_trattativa'
  | 'convertito'
  | 'perso';

// Campi comuni a tutti i lead
export interface BaseLead {
  id?: number;
  name: string;
  surname: string;
  email: string;
  mobile: string;
  address?: string;
  service_type?: string;
  privacy_accepted: boolean;
  lead_type: LeadType;
  lead_status?: LeadStatus;
  read?: boolean;
  created_at?: string;
}

// Form contatto utente standard (contact)
export interface ContactLead extends BaseLead {
  lead_type: 'contact';
  message?: string;
}

// Form fornitore (supplier)
export interface SupplierLead extends BaseLead {
  lead_type: 'supplier';
  company: string;
  role?: string;
  pec?: string;
  notes?: string;
}

// Form preventivo gratuito (free_estimate)
export interface FreeEstimateLead extends BaseLead {
  lead_type: 'free_estimate';
  square_meters?: number;
  floor?: string;
  budget?: string;
  notes?: string;
}

// Union type per tutti i tipi di lead
export type Lead = ContactLead | SupplierLead | FreeEstimateLead;

// Type per l'inserimento (senza campi generati dal DB)
export type LeadInsert = Omit<Lead, 'id' | 'created_at' | 'lead_status' | 'read'>;
