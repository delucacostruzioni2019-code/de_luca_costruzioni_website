import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    _iub: {
      csConfiguration: IubendaConfig;
      csReady: () => void;
      csRejectAll: () => void;
      csAcceptAll: () => void;
    };
    iubenda: {
      allowed: (purpose: string) => boolean;
      reject: (purpose: string) => void;
    };
  }
}

interface IubendaConfig {
  lang: string;
  siteId: number;
  cookiePolicyId: number;
  privacyPolicyId?: number;
  banner?: {
    acceptButtonDisplay?: boolean;
    customizeButtonDisplay?: boolean;
    acceptButtonColor?: string;
    acceptButtonCaptionColor?: string;
    customizeButtonColor?: string;
    customizeButtonCaptionColor?: string;
    rejectButtonDisplay?: boolean;
    rejectButtonColor?: string;
    rejectButtonCaptionColor?: string;
    position?: 'float-top-left' | 'float-top-right' | 'float-bottom-left' | 'float-bottom-right' | 'top' | 'bottom';
    textColor?: string;
    backgroundColor?: string;
  };
  callback?: {
    onConsentGiven?: () => void;
    onConsentRejected?: () => void;
    onPreferenceExpressed?: (preference: any) => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class IubendaService {
  private isScriptLoaded = false;
  private config: IubendaConfig = {
    lang: 'it',
    siteId: 0, // Da configurare quando l'account Iubenda è pronto
    cookiePolicyId: 0, // Da configurare
    privacyPolicyId: 0, // Da configurare
    banner: {
      acceptButtonDisplay: true,
      customizeButtonDisplay: true,
      rejectButtonDisplay: true,
      position: 'bottom',
      acceptButtonColor: '#1a5f7a',
      acceptButtonCaptionColor: '#ffffff',
      customizeButtonColor: '#f4f4f4',
      customizeButtonCaptionColor: '#1a5f7a',
      rejectButtonColor: '#6c757d',
      rejectButtonCaptionColor: '#ffffff',
      textColor: '#333333',
      backgroundColor: '#ffffff'
    },
    callback: {
      onConsentGiven: () => {
        console.log('✅ Consenso fornito dall\'utente');
        this.enableAnalytics();
      },
      onConsentRejected: () => {
        console.log('❌ Consenso rifiutato dall\'utente');
        this.disableAnalytics();
      },
      onPreferenceExpressed: (preference) => {
        console.log('🔧 Preferenze espresse:', preference);
        this.handlePreferences(preference);
      }
    }
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Inizializza Iubenda Cookie Solution
   */
  async initialize(siteId?: number, cookiePolicyId?: number, privacyPolicyId?: number): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Aggiorna configurazione se forniti i parametri
    if (siteId) this.config.siteId = siteId;
    if (cookiePolicyId) this.config.cookiePolicyId = cookiePolicyId;
    if (privacyPolicyId) this.config.privacyPolicyId = privacyPolicyId;

    // Verifica che i parametri necessari siano configurati
    if (!this.config.siteId || !this.config.cookiePolicyId) {
      console.warn('⚠️ Iubenda non inizializzato: siteId e cookiePolicyId sono necessari');
      return;
    }

    try {
      await this.loadIubendaScript();
      this.setupGlobalConfiguration();
      console.log('✅ Iubenda inizializzato correttamente');
    } catch (error) {
      console.error('❌ Errore nell\'inizializzazione di Iubenda:', error);
    }
  }

  /**
   * Carica lo script di Iubenda
   */
  private loadIubendaScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isScriptLoaded) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.iubenda.com/cs/tcf/stub-v2.js';
      script.async = true;
      script.onload = () => {
        this.isScriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Iubenda script'));

      document.head.appendChild(script);
    });
  }

  /**
   * Configura la configurazione globale di Iubenda
   */
  private setupGlobalConfiguration(): void {
    if (typeof window !== 'undefined') {
      window._iub = window._iub || {};
      window._iub.csConfiguration = this.config;
    }
  }

  /**
   * Verifica se un determinato consenso è stato dato
   */
  isConsentGiven(purpose: string = 'analytics'): boolean {
    if (!isPlatformBrowser(this.platformId) || !window.iubenda) {
      return false;
    }
    
    return window.iubenda.allowed(purpose);
  }

  /**
   * Accetta tutti i cookie
   */
  acceptAll(): void {
    if (!isPlatformBrowser(this.platformId) || !window._iub) {
      return;
    }

    if (window._iub.csAcceptAll) {
      window._iub.csAcceptAll();
    }
  }

  /**
   * Rifiuta tutti i cookie
   */
  rejectAll(): void {
    if (!isPlatformBrowser(this.platformId) || !window._iub) {
      return;
    }

    if (window._iub.csRejectAll) {
      window._iub.csRejectAll();
    }
  }

  /**
   * Mostra il banner delle preferenze
   */
  showPreferences(): void {
    if (!isPlatformBrowser(this.platformId) || !window._iub) {
      return;
    }

    if (window._iub.csReady) {
      window._iub.csReady();
    }
  }

  /**
   * Abilita analytics quando il consenso è dato
   */
  private enableAnalytics(): void {
    // Qui puoi abilitare Google Analytics, Google Tag Manager, ecc.
    console.log('🔍 Analytics abilitato');
    
    // Esempio: abilita Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }

    // Esempio: abilita Google Tag Manager
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        'event': 'consent_granted',
        'consent_type': 'analytics'
      });
    }
  }

  /**
   * Disabilita analytics quando il consenso è rifiutato
   */
  private disableAnalytics(): void {
    console.log('🚫 Analytics disabilitato');
    
    // Esempio: disabilita Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }

    // Rimuovi cookie di analytics esistenti
    this.removeCookies(['_ga', '_gat', '_gid']);
  }

  /**
   * Gestisce le preferenze specifiche dell'utente
   */
  private handlePreferences(preference: any): void {
    // Gestisci le preferenze specifiche basate su quello che l'utente ha scelto
    if (preference.analytics) {
      this.enableAnalytics();
    } else {
      this.disableAnalytics();
    }

    // Altri servizi possono essere gestiti qui
    // es. marketing, social media, ecc.
  }

  /**
   * Rimuove cookie specifici
   */
  private removeCookies(cookieNames: string[]): void {
    cookieNames.forEach(name => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  }

  /**
   * Ottieni l'URL della privacy policy
   */
  getPrivacyPolicyUrl(): string {
    if (!this.config.privacyPolicyId) {
      return '';
    }
    return `https://www.iubenda.com/privacy-policy/${this.config.privacyPolicyId}`;
  }

  /**
   * Ottieni l'URL della cookie policy
   */
  getCookiePolicyUrl(): string {
    if (!this.config.cookiePolicyId) {
      return '';
    }
    return `https://www.iubenda.com/privacy-policy/${this.config.cookiePolicyId}/cookie-policy`;
  }

  /**
   * Metodo per test dell'integrazione (da rimuovere in produzione)
   */
  testIntegration(): void {
    console.log('🔧 Test integrazione Iubenda');
    console.log('Configurazione:', this.config);
    console.log('Script caricato:', this.isScriptLoaded);
    console.log('Window._iub:', (typeof window !== 'undefined') ? window._iub : 'undefined');
  }
}

function gtag(arg0: string, arg1: string, arg2: { analytics_storage: string; }) {
  throw new Error('Function not implemented.');
}
