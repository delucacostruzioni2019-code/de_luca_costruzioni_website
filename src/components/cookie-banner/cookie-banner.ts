import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IubendaService } from '../../services/iubenda.service';

@Component({
  selector: 'app-cookie-banner',
  imports: [CommonModule],
  templateUrl: './cookie-banner.html',
  styleUrl: './cookie-banner.scss',
})
export class CookieBanner implements OnInit, OnDestroy {
  private iubendaService = inject(IubendaService);
  
  showBanner = false;
  private bannerCheckInterval?: number;

  ngOnInit(): void {
    // Verifica se il banner deve essere mostrato
    this.checkBannerVisibility();
    
    // Controlla periodicamente se Iubenda ha nascosto il banner
    this.bannerCheckInterval = window.setInterval(() => {
      this.checkBannerVisibility();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.bannerCheckInterval) {
      clearInterval(this.bannerCheckInterval);
    }
  }

  /**
   * Verifica se il banner deve essere mostrato
   * (fallback nel caso in cui Iubenda non si carichi correttamente)
   */
  private checkBannerVisibility(): void {
    // Se Iubenda è caricato correttamente, nascondi il banner fallback
    if (typeof window !== 'undefined' && window._iub && window._iub.csConfiguration) {
      this.showBanner = false;
      return;
    }

    // Se non c'è consenso salvato localmente, mostra il banner
    const savedConsent = localStorage.getItem('cookie_consent');
    this.showBanner = !savedConsent;
  }

  /**
   * Accetta tutti i cookie (fallback)
   */
  acceptAll(): void {
    this.iubendaService.acceptAll();
    this.saveConsentLocally('accepted');
    this.showBanner = false;
  }

  /**
   * Rifiuta tutti i cookie (fallback)
   */
  rejectAll(): void {
    this.iubendaService.rejectAll();
    this.saveConsentLocally('rejected');
    this.showBanner = false;
  }

  /**
   * Mostra le preferenze dettagliate
   */
  showPreferences(): void {
    this.iubendaService.showPreferences();
  }

  /**
   * Salva il consenso localmente come backup
   */
  private saveConsentLocally(status: 'accepted' | 'rejected'): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cookie_consent', JSON.stringify({
        status,
        timestamp: new Date().toISOString()
      }));
    }
  }
}