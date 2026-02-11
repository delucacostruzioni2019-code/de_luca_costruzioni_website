import { inject, Injectable, signal } from '@angular/core';
import { Supabase } from './supabase';
import { Lead, LeadInsert } from '../models/lead';

@Injectable({
  providedIn: 'root',
})
export class LeadService {
  private supabase = inject(Supabase);
  
  unreadLeadsCount = signal<number>(0);

  async saveContactLead(leadData: LeadInsert): Promise<Lead> {
    // Assicuriamoci che il lead_status sia impostato a 'nuovo' se non specificato
    const leadWithStatus = {
      ...leadData,
      lead_status: leadData.lead_status || 'nuovo'
    };

    const { data, error } = await this.supabase
      .from('leads')
      .insert(leadWithStatus)
      .select()
      .single();

    if (error) {
      console.error('Errore salvataggio lead:', error);
      throw error;
    }

    return data;
  }

  async getLeads(): Promise<Lead[]> {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Errore recupero leads:', error);
      throw error;
    }

    return data ?? [];
  }

  async getLeadById(id: number): Promise<Lead | null> {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Errore recupero lead:', error);
      throw error;
    }

    return data;
  }

  async markLeadAsRead(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('leads')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      console.error('Errore aggiornamento lead:', error);
      throw error;
    }
    
    await this.updateUnreadCount();
  }

  async getUnreadLeadsCount(): Promise<number> {
    const { data, error } = await this.supabase
      .from('leads')
      .select('id')
      .eq('read', false);

    if (error) {
      console.error('Errore conteggio leads non letti:', error);
      return 0;
    }

    return data?.length ?? 0;
  }

  async updateUnreadCount(): Promise<void> {
    try {
      const count = await this.getUnreadLeadsCount();
      this.unreadLeadsCount.set(count);
    } catch (error) {
      console.error('Errore nell\'aggiornamento contatore:', error);
    }
  }
}
