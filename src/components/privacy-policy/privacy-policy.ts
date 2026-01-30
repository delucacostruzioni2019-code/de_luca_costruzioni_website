import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IubendaService } from '../../services/iubenda.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-privacy-policy',
  imports: [CommonModule],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})
export class PrivacyPolicy implements OnInit {
  private iubendaService = inject(IubendaService);
  private sanitizer = inject(DomSanitizer);
  
  privacyPolicyUrl: SafeResourceUrl = '';
  cookiePolicyUrl: SafeResourceUrl = '';
  isLoading = true;
  showFallback = false;

  ngOnInit(): void {
    this.loadPolicyUrls();
  }

  /**
   * Carica gli URL delle policy da Iubenda
   */
  private loadPolicyUrls(): void {
    try {
      const privacyUrl = this.iubendaService.getPrivacyPolicyUrl();
      const cookieUrl = this.iubendaService.getCookiePolicyUrl();

      if (privacyUrl) {
        this.privacyPolicyUrl = this.sanitizer.bypassSecurityTrustResourceUrl(privacyUrl);
      }

      if (cookieUrl) {
        this.cookiePolicyUrl = this.sanitizer.bypassSecurityTrustResourceUrl(cookieUrl);
      }

      // Se non ci sono URL configurati, mostra il fallback
      if (!privacyUrl && !cookieUrl) {
        this.showFallback = true;
      }

      this.isLoading = false;
    } catch (error) {
      console.error('Errore nel caricamento delle policy:', error);
      this.showFallback = true;
      this.isLoading = false;
    }
  }

  /**
   * Gestisce il click per aprire le preferenze cookie
   */
  openCookiePreferences(): void {
    this.iubendaService.showPreferences();
  }

  /**
   * Ottiene la data corrente formattata
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString('it-IT');
  }
}