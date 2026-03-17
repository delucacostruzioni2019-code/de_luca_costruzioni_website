import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Supabase } from '../../../services/supabase';
import { Router } from '@angular/router';
import { Lead, LeadType, LeadStatus } from '../../../models/lead';
import { Paginator } from '../../../components/paginator/paginator';
import { LeadService } from '../../../services/lead';

@Component({
  selector: 'admin-lead-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Paginator],
  templateUrl: './lead-list.html',
  styleUrl: './lead-list.scss',
})
export default class LeadList implements OnInit {
  private supabase = inject(Supabase);
  private router = inject(Router);
  private leadService = inject(LeadService);

  loading = signal(false);
  allLeads = signal<Lead[]>([]);
  selectedLead: Lead | null = null;

  // Filtri
  searchTerm = signal('');
  filterType = signal<LeadType | 'all'>('all');
  filterStatus = signal<LeadStatus | 'all'>('all');
  filterRead = signal<'all' | 'read' | 'unread'>('all');

  // Paginazione
  currentPage = signal(1);
  itemsPerPage = 10;

  // Computed per lead filtrati
  filteredLeads = computed(() => {
    let leads = this.allLeads();

    // Filtro per tipo
    if (this.filterType() !== 'all') {
      leads = leads.filter(l => l.lead_type === this.filterType());
    }

    // Filtro per stato
    if (this.filterStatus() !== 'all') {
      leads = leads.filter(l => l.lead_status === this.filterStatus());
    }

    // Filtro per lettura
    if (this.filterRead() === 'read') {
      leads = leads.filter(l => l.read === true);
    } else if (this.filterRead() === 'unread') {
      leads = leads.filter(l => l.read === false);
    }

    // Filtro per ricerca
    const search = this.searchTerm().toLowerCase();
    if (search) {
      leads = leads.filter(l => {
        const company = l.lead_type === 'supplier' ? (l as any).company : '';
        return (
          l.name?.toLowerCase().includes(search) ||
          l.surname?.toLowerCase().includes(search) ||
          l.email?.toLowerCase().includes(search) ||
          l.mobile?.includes(search) ||
          company?.toLowerCase().includes(search)
        );
      });
    }

    return leads;
  });

  // Lead paginati
  paginatedLeads = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredLeads().slice(start, end);
  });

  ngOnInit() {
    this.loadLeads();
  }

  async loadLeads() {
    this.loading.set(true);
    try {
      const { data, error } = await this.supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      this.allLeads.set(data || []);
    } catch (error) {
      console.error('Errore caricamento leads:', error);
      alert('Errore nel caricamento dei lead');
    } finally {
      this.loading.set(false);
    }
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  clearFilters() {
    this.searchTerm.set('');
    this.filterType.set('all');
    this.filterStatus.set('all');
    this.filterRead.set('all');
    this.currentPage.set(1);
  }

  truncateMessage(message: string, maxLength: number = 150): string {
    if (!message || message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  }

  getUnreadCount(): number {
    return this.allLeads().filter((l: Lead) => !l.read).length;
  }

  getLeadTypeLabel(type: LeadType): string {
    const labels: Record<LeadType, string> = {
      contact: 'Contatto',
      supplier: 'Fornitore',
      free_estimate: 'Preventivo'
    };
    return labels[type];
  }

  getLeadStatusLabel(status: LeadStatus | null | undefined): string {
    if (!status) return 'Nuovo';
    const labels: Record<LeadStatus, string> = {
      nuovo: 'Nuovo',
      contattato: 'Contattato',
      sopralluogo_fissato: 'Sopralluogo fissato',
      in_trattativa: 'In trattativa',
      convertito: 'Convertito',
      perso: 'Perso'
    };
    return labels[status];
  }

  viewLead(lead: Lead) {
    this.openLeadDetail(lead, new Event('click'));
  }

  async openLeadDetail(lead: Lead, event: Event) {
    event.stopPropagation();
    this.selectedLead = lead;

    // Marca come letto
    if (!lead.read && lead.id) {
      await this.leadService.markLeadAsRead(lead.id);
      await this.loadLeads();
    }
  }

  closeModal() {
    this.selectedLead = null;
  }

  async toggleRead(lead: Lead, event: Event, forceRead = false) {
    event.stopPropagation();

    try {
      const newReadStatus = forceRead ? true : !lead.read;

      const { error } = await this.supabase
        .from('leads')
        .update({ read: newReadStatus })
        .eq('id', lead.id);

      if (error) throw error;

      await this.loadLeads();
      
      // Aggiorna il contatore globale
      await this.leadService.updateUnreadCount();

      if (this.selectedLead && this.selectedLead.id === lead.id) {
        this.selectedLead.read = newReadStatus;
      }
    } catch (error) {
      console.error('Errore aggiornamento stato:', error);
      alert('Errore nell\'aggiornamento');
    }
  }

  async updateLeadStatus(lead: Lead, newStatus: LeadStatus, event?: Event) {
    if (event) event.stopPropagation();

    try {
      const { error } = await this.supabase
        .from('leads')
        .update({ lead_status: newStatus })
        .eq('id', lead.id);

      if (error) throw error;

      await this.loadLeads();
      
      // Aggiorna anche il lead selezionato se è aperto
      if (this.selectedLead && this.selectedLead.id === lead.id) {
        this.selectedLead.lead_status = newStatus;
      }

      console.log(`Stato aggiornato a: ${this.getLeadStatusLabel(newStatus)}`);
    } catch (error) {
      console.error('Errore aggiornamento stato:', error);
      alert('Errore nell\'aggiornamento dello stato');
    }
  }

  getAvailableStatuses(): { value: LeadStatus; label: string }[] {
    return [
      { value: 'nuovo', label: 'Nuovo' },
      { value: 'contattato', label: 'Contattato' },
      { value: 'sopralluogo_fissato', label: 'Sopralluogo fissato' },
      { value: 'in_trattativa', label: 'In trattativa' },
      { value: 'convertito', label: 'Convertito' },
      { value: 'perso', label: 'Perso' }
    ];
  }

  async deleteLead(lead: Lead, event?: Event) {
    if (event) event.stopPropagation();

    if (!confirm(`Sei sicuro di voler eliminare questo lead?`)) {
      return;
    }

    try {
      const { error } = await this.supabase
        .from('leads')
        .delete()
        .eq('id', lead.id);

      if (error) throw error;

      this.closeModal();
      await this.loadLeads();
      alert('Lead eliminato con successo');
    } catch (error) {
      console.error('Errore eliminazione:', error);
      alert('Errore nell\'eliminazione');
    }
  }

  /**
   * Converte una data ISO string al formato datetime-local per l'input HTML
   * Converte da UTC a ora locale del browser
   */
  formatDateForInput(dateString: string | null | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    // getHours/getMinutes ritornano le ore/minuti nel timezone locale del browser
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Converte da datetime-local (locale del browser) a UTC ISO string per Supabase
   * Risolve il problema di timezone: mantiene l'orario selezionato convertendolo correttamente a UTC
   */
  private localDateTimeToUTC(dateTimeLocalValue: string): string {
    // dateTimeLocalValue = "2026-03-17T12:30" (orario locale selezionato dall'utente)
    const [datePart, timePart] = dateTimeLocalValue.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    // Crea una data usando i constructor con componenti locali
    // new Date(year, month-1, day, hours, minutes) interpreta questi valori come locali
    // e li converte internamente a UTC
    const localDate = new Date(year, month - 1, day, hours, minutes, 0);

    // toISOString() ritorna il valore UTC corretto
    // Es: se l'utente è in Italia (+01:00) e seleziona 12:30:
    // -> new Date(2026, 2, 17, 12, 30, 0) crea 12:30 locale = 11:30 UTC
    // -> toISOString() ritorna "2026-03-17T11:30:00Z"
    return localDate.toISOString();
  }

  /**
   * Aggiorna la data di sopralluogo del lead
   */
  async updateInspectionDate(lead: Lead, event: Event) {
    const input = event.target as HTMLInputElement;
    const newDate = input.value;

    if (!newDate || !lead.id) {
      alert('Data non valida');
      return;
    }

    try {
      // Converti da datetime-local a UTC ISO string
      const isoDateUTC = this.localDateTimeToUTC(newDate);

      const { error } = await this.supabase
        .from('leads')
        .update({ inspection_date: isoDateUTC })
        .eq('id', lead.id);

      if (error) throw error;

      // Aggiorna il lead selezionato
      if (this.selectedLead && this.selectedLead.id === lead.id) {
        this.selectedLead.inspection_date = isoDateUTC;
      }

      await this.loadLeads();
      console.log('Data di sopralluogo aggiornata con successo');
    } catch (error) {
      console.error('Errore aggiornamento data:', error);
      alert('Errore nell\'aggiornamento della data');
    }
  }

  /**
   * Aggiorna le note amministratore del lead
   */
  async updateAdminNotes(lead: Lead) {
    if (!lead.id) return;

    try {
      const { error } = await this.supabase
        .from('leads')
        .update({ admin_notes: lead.admin_notes || null })
        .eq('id', lead.id);

      if (error) throw error;

      console.log('Note amministratore salvate con successo');
    } catch (error) {
      console.error('Errore aggiornamento note:', error);
      alert('Errore nel salvataggio delle note');
    }
  }
}
