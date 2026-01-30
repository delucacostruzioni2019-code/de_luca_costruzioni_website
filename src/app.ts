import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Footer } from "./components/footer/footer";
import Navbar from './components/navbar/navbar';
import { CookieBanner } from './components/cookie-banner/cookie-banner';
import { SEOService } from './services/seo.service';
import { PerformanceService } from './services/performance.service';
import { IubendaService } from './services/iubenda.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, Navbar, CookieBanner],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

  private router = inject(Router);
  private seoService = inject(SEOService);
  private performanceService = inject(PerformanceService);
  private iubendaService = inject(IubendaService);

  // 🟢 Il Signal che gestisce lo stato di visualizzazione
  public hideComponent = signal<boolean>(false);
  // Prefisso da nascondere
  private readonly adminPrefix = '/admin';

  constructor() {
    // 👂 Sottoscrizione una tantum all'Observable del router
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => {
      const url = event.urlAfterRedirects;

      const shouldHide = url.startsWith(this.adminPrefix);

      // 🎯 Aggiorna il Signal con il nuovo valore
      this.hideComponent.set(shouldHide);
    });
  }

  ngOnInit() {
    // Inizializza performance optimizations
    this.performanceService.initializePerformanceOptimizations();

    // Imposta lingua italiana di default
    this.seoService.setLanguage('it');

    // Inizializza Iubenda (temporaneamente senza parametri - da configurare quando l'account è pronto)
    this.iubendaService.initialize();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      });
  }
}
