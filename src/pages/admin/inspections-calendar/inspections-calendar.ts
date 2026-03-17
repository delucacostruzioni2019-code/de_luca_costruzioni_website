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
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const weeks: CalendarWeek[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentDate = new Date(startDate);
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      const week: CalendarWeek = { days: [] };

      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(currentDate);
        const dayNumber = dayDate.getDate();
        const isCurrentMonth = dayDate.getMonth() === month;
        const isTodayCheck = dayDate.getTime() === today.getTime();

        // Trova i sopralluoghi per questo giorno
        const dailyInspections = this.inspections().filter(inspection => {
          if (!inspection.inspection_date) return false;
          const inspectionDate = new Date(inspection.inspection_date);
          inspectionDate.setHours(0, 0, 0, 0);
          return inspectionDate.getTime() === dayDate.getTime();
        });

        week.days.push({
          date: new Date(dayDate),
          dayNumber,
          isCurrentMonth,
          isToday: isTodayCheck,
          inspections: dailyInspections
        });

        currentDate.setDate(currentDate.getDate() + 1);
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
