import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Supabase } from '../../../services/supabase';
import { Lead } from '../../../models/lead';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  inspections: Lead[];
}

interface CalendarWeek {
  days: CalendarDay[];
}

@Component({
  selector: 'admin-inspections-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inspections-calendar.html',
  styleUrl: './inspections-calendar.scss',
})
export default class InspectionsCalendar implements OnInit {
  private supabase = inject(Supabase);
  private router = inject(Router);

  loading = signal(false);
  inspections = signal<Lead[]>([]);
  selectedInspection: Lead | null = null;

  currentDate = signal<Date>(new Date());
  calendarDays = signal<CalendarWeek[]>([]);

  monthYear = computed(() => {
    const date = this.currentDate();
    return new Intl.DateTimeFormat('it-IT', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  });

  ngOnInit() {
    this.loadInspections();
  }

  async loadInspections() {
    this.loading.set(true);
    try {
      const { data, error } = await this.supabase
        .from('leads')
        .select('*')
        .eq('lead_status', 'sopralluogo_fissato')
        .not('inspection_date', 'is', null)
        .order('inspection_date', { ascending: true });

      if (error) throw error;

      const leads = data || [];
      this.inspections.set(leads);
      this.buildCalendar();
    } catch (error) {
      console.error('Errore caricamento appuntamenti:', error);
      alert('Errore nel caricamento degli appuntamenti');
    } finally {
      this.loading.set(false);
    }
  }

  private buildCalendar() {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();

    // 1. Trova il primo giorno del mese
    const firstDayOfMonth = new Date(year, month, 1);
    // 2. Trova l'ultimo giorno del mese
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // 3. Calcola l'inizio del calendario (sempre Lunedì)
    // getDay(): 0=Dom, 1=Lun... 6=Sab
    const dayOfWeek = firstDayOfMonth.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(firstDayOfMonth.getDate() - diffToMonday);

    // 4. Calcola la fine del calendario (sempre Domenica)
    const endDayOfWeek = lastDayOfMonth.getDay();
    const diffToSunday = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;

    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(lastDayOfMonth.getDate() + diffToSunday);

    const weeks: CalendarWeek[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let tempDate = new Date(startDate);

    // Ciclo sicuro: camminiamo da startDate a endDate
    while (tempDate <= endDate) {
      const week: CalendarWeek = { days: [] };

      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(tempDate);

        const dailyInspections = this.inspections().filter(inspection => {
          if (!inspection.inspection_date) return false;
          const d = new Date(inspection.inspection_date);
          return d.getFullYear() === dayDate.getFullYear() &&
            d.getMonth() === dayDate.getMonth() &&
            d.getDate() === dayDate.getDate();
        });

        week.days.push({
          date: dayDate,
          dayNumber: dayDate.getDate(),
          isCurrentMonth: dayDate.getMonth() === month,
          isToday: dayDate.setHours(0, 0, 0, 0) === today.getTime(),
          inspections: dailyInspections
        });

        tempDate.setDate(tempDate.getDate() + 1);
      }
      weeks.push(week);
    }

    this.calendarDays.set(weeks);
  }

  previousMonth() {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() - 1);
    this.currentDate.set(newDate);
    this.buildCalendar();
  }

  nextMonth() {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() + 1);
    this.currentDate.set(newDate);
    this.buildCalendar();
  }

  today() {
    this.currentDate.set(new Date());
    this.buildCalendar();
  }

  closeModal() {
    this.selectedInspection = null;
  }

  getLeadTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      contact: 'Contatto',
      supplier: 'Fornitore',
      free_estimate: 'Preventivo'
    };
    return labels[type] || type;
  }

  openInspectionDetails(inspection: Lead) {
    this.selectedInspection = inspection;
  }

  goBackToLeads() {
    this.router.navigate(['/admin/lead']);
  }
}
