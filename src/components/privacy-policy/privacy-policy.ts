import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

declare global {
  interface Window {
    _iub: any;
  }
}

@Component({
  selector: 'app-privacy-policy',
  imports: [CommonModule],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})
export class PrivacyPolicy implements OnInit {
  private sanitizer = inject(DomSanitizer);
  
  privacyPolicyUrl: SafeResourceUrl = '';
  cookiePolicyUrl: SafeResourceUrl = '';
  isLoading = true;
  showFallback = false;

  // URLs diretti da Iubenda (da sostituire con i tuoi ID reali)
  private readonly PRIVACY_POLICY_ID = 55772221; // Da sostituire con il tuo ID privacy
  private readonly COOKIE_POLICY_ID = 55772221;  // Da sostituire con il tuo ID cookie

  ngOnInit(): void {
    this.loadPolicyUrls();
  }

  /**
   * Carica gli URL delle policy da Iubenda
   */
  private loadPolicyUrls(): void {
    try {
      const privacyUrl = `https://www.iubenda.com/privacy-policy/${this.PRIVACY_POLICY_ID}`;
      const cookieUrl = `https://www.iubenda.com/privacy-policy/${this.COOKIE_POLICY_ID}/cookie-policy`;

      this.privacyPolicyUrl = this.sanitizer.bypassSecurityTrustResourceUrl(privacyUrl);
      this.cookiePolicyUrl = this.sanitizer.bypassSecurityTrustResourceUrl(cookieUrl);

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
    if (window._iub && typeof window._iub.csReady === 'function') {
      window._iub.csReady();
    } else {
      console.warn('⚠️ Iubenda not ready, trying again in 500ms');
      setTimeout(() => {
        if (window._iub && typeof window._iub.csReady === 'function') {
          window._iub.csReady();
        } else {
          console.error('❌ Iubenda csReady not available after retry');
        }
      }, 500);
    }
  }

  /**
   * Ottiene la data corrente formattata
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString('it-IT');
  }
}