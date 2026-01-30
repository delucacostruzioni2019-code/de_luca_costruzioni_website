import { Injectable, Inject, DOCUMENT } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  /**
   * Preload delle immagini critiche
   */
  preloadCriticalImages(): void {
    const criticalImages = [
      '/assets/images/hero-bg.jpg',
      '/assets/images/logo_transparent.svg',
      '/assets/images/logo_blue.svg'
    ];

    criticalImages.forEach(src => {
      const link = this.document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      this.document.head.appendChild(link);
    });
  }

  /**
   * Lazy loading delle immagini non critiche
   */
  setupImageLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset['src'];
            if (src) {
              img.src = src;
              img.classList.remove('lazy');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      // Osserva tutte le immagini con classe 'lazy'
      const lazyImages = this.document.querySelectorAll('img.lazy');
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }

  /**
   * Ottimizzazione font loading
   */
  optimizeFontLoading(): void {
    // Preconnect a Google Fonts già fatto in index.html
    // Qui possiamo aggiungere font-display: swap nei CSS
    const style = this.document.createElement('style');
    style.innerHTML = `
      @font-face {
        font-family: 'Outfit';
        font-display: swap;
      }
      @font-face {
        font-family: 'Bebas Neue';
        font-display: swap;
      }
    `;
    this.document.head.appendChild(style);
  }

  /**
   * Defer degli script non critici
   */
  deferNonCriticalScripts(): void {
    // Gli script sono già deferiti in index.html
    console.log('🚀 Script non critici deferiti');
  }

  /**
   * Comprimi immagini e converti a WebP
   */
  convertImagesToWebP(): string[] {
    // Questa funzione restituisce le istruzioni per il build process
    return [
      'Installa sharp: npm install --save-dev sharp',
      'Crea script di build per convertire immagini a WebP',
      'Usa <picture> con fallback per browser compatibility',
      'Esempio: <picture><source srcset="image.webp" type="image/webp"><img src="image.jpg" alt=""></picture>'
    ];
  }

  /**
   * Performance monitoring
   */
  measurePerformance(): void {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const metrics = {
            // Core Web Vitals
            FCP: this.getFCP(),
            LCP: this.getLCP(),
            CLS: this.getCLS(),
            FID: this.getFID(),
            // Other metrics
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            timeToFirstByte: perfData.responseStart - perfData.requestStart
          };

          console.log('📊 Performance Metrics:', metrics);
          
          // In produzione, invia a analytics
          // this.sendToAnalytics(metrics);
        }, 0);
      });
    }
  }

  /**
   * First Contentful Paint
   */
  private getFCP(): number {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  /**
   * Largest Contentful Paint
   */
  private getLCP(): number {
    return new Promise<number>((resolve) => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }) as any;
  }

  /**
   * Cumulative Layout Shift
   */
  private getCLS(): number {
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
    return clsValue;
  }

  /**
   * First Input Delay
   */
  private getFID(): number {
    return new Promise<number>((resolve) => {
      new PerformanceObserver((entryList) => {
        const firstEntry = entryList.getEntries()[0];
        resolve((firstEntry as any).processingStart - firstEntry.startTime);
      }).observe({ entryTypes: ['first-input'] });
    }) as any;
  }

  /**
   * Resource hints per performance
   */
  addResourceHints(): void {
    const hints = [
      { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
      { rel: 'dns-prefetch', href: 'https://maps.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
    ];

    hints.forEach(hint => {
      if (!this.document.querySelector(`link[href="${hint.href}"]`)) {
        const link = this.document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        if ((hint as any).crossorigin) {
          link.crossOrigin = 'anonymous';
        }
        this.document.head.appendChild(link);
      }
    });
  }

  /**
   * Inizializza tutte le ottimizzazioni
   */
  initializePerformanceOptimizations(): void {
    this.preloadCriticalImages();
    this.optimizeFontLoading();
    this.addResourceHints();
    this.measurePerformance();
    
    // Setup lazy loading dopo che il DOM è caricato
    if (this.document.readyState === 'loading') {
      this.document.addEventListener('DOMContentLoaded', () => {
        this.setupImageLazyLoading();
      });
    } else {
      this.setupImageLazyLoading();
    }
  }
}