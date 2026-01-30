import { Component, OnInit, inject, signal, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HeroBanner } from "../../components/hero-banner/hero-banner";
import { FollowOn } from "../../components/follow-on/follow-on";
import { Router, ActivatedRoute } from '@angular/router';
import { Supabase } from '../../services/supabase';
import Swiper from 'swiper';
import { Pagination, Navigation, Thumbs } from 'swiper/modules';
import { Subscription } from 'rxjs';
import { ImageData } from '../../models/image-data';
import { RistrutturazioniService } from '../../services/ristrutturazioni';
import { SEOService } from '../../services/seo.service';

@Component({
  selector: 'app-portfolio-detail',
  standalone: true,
  imports: [HeroBanner, FollowOn],
  templateUrl: './portfolio-detail.html',
  styleUrl: './portfolio-detail.scss',
})
export default class PortfolioDetail implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private ristrutturazioniService = inject(RistrutturazioniService);
  private supabase = inject(Supabase);
  private cdr = inject(ChangeDetectorRef);
  private seoService = inject(SEOService);
  private swiper?: Swiper;
  private fullscreenSwiper?: Swiper;
  private thumbsSwiper?: Swiper;
  fullscreenOpen = false;
  private _prevBodyOverflow?: string;
  private _prevBodyPosition?: string;
  private _prevBodyTop?: string;
  private _prevBodyLeft?: string;
  private _scrollY = 0;
  private _navbarEl?: HTMLElement;
  private _prevNavbarDisplay?: string;
  // keydown handler reference for add/removeEventListener
  private _onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.fullscreenOpen) {
      this.closeFullscreen();
    }
  };

  project = signal<any | null>(null);
  loading = signal(false);
  private _routeSub?: Subscription;
  private _fullscreenCategory = signal<'beforeImages' | 'afterImages' | null>(null);
  private allProjects: any[] = [];
  private currentProjectIndex = -1;
  private projectsCache: Map<number, any> = new Map();

  // Getter per le immagini della categoria attuale in fullscreen
  get fullscreenImages(): any[] {
    const immagini = this.project()?.immagini;
    const category = this._fullscreenCategory();
    if (!immagini || !category) return [];
    return immagini[category] ?? [];
  }

  get previousProject(): any | null {
    const currentId = this.project()?.id;
    if (!currentId || !this.allProjects.length) return null;

    // Usa findIndex ma con l'assumption che la lista non sia troppo grande
    // oppure potrebbe essere ottimizzato ulteriormente con indici persistenti
    const currentIdx = this.allProjects.findIndex((p: any) => p.id === currentId);
    if (currentIdx > 0) {
      return this.allProjects[currentIdx - 1];
    }
    return null;
  }

  get nextProject(): any | null {
    const currentId = this.project()?.id;
    if (!currentId || !this.allProjects.length) return null;

    const currentIdx = this.allProjects.findIndex((p: any) => p.id === currentId);
    if (currentIdx >= 0 && currentIdx < this.allProjects.length - 1) {
      return this.allProjects[currentIdx + 1];
    }
    return null;
  }

  navigateToProject(projectId: number): void {
    this.router.navigate(['portfolio', projectId]);
  }

  goToPortfolio(): void {
    this.router.navigate(['portfolio']);
  }

  async ngOnInit(): Promise<void> {
    // Svuota il cache sessionStorage all'ingresso della pagina
    // così ogni reload (F5) ricarica i dati freschi da Supabase
    sessionStorage.removeItem('portfolio_projects_list');

    // Carica lista di tutti i progetti per navigazione
    await this.loadAllProjects();

    // Subscribe to route param changes so the same component instance
    // refreshes when navigating between projects without a full reload.
    this._routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProjectById(id);
      }
    });

    // aggiungi listener per ESC
    window.addEventListener('keydown', this._onKeyDown);
  }

  private async loadAllProjects(): Promise<void> {
    try {
      // Prova a recuperare la lista da sessionStorage (cache per la sessione)
      const cached = sessionStorage.getItem('portfolio_projects_list');
      if (cached) {
        try {
          const data = JSON.parse(cached);
          this.allProjects = data;
          // Ricostruisci la mappa di cache
          this.projectsCache.clear();
          data.forEach((p: any) => {
            this.projectsCache.set(p.id, p);
          });
          return;
        } catch (e) {
          // Se il parsing fallisce, continua a caricare da Supabase
        }
      }

      // Se non in cache, carica da Supabase
      await this.ristrutturazioniService.getRistrutturazioni();

      const data = this.ristrutturazioniService.ristrutturazioni();

      if (data.length > 0) {
        this.allProjects = data;
        // Popola mappa per ricerche veloci
        this.projectsCache.clear();

        // Cache nella sessione
        try {
          sessionStorage.setItem('portfolio_projects_list', JSON.stringify(data));
        } catch (e) {
          // Ignora errori di storage (es. quota exceeded)
        }
      }
    } catch (e) {
      console.error('Errore nel caricamento lista progetti:', e);
    }
  }

  private async loadProjectById(id: string): Promise<void> {

    // Traccia indice del progetto corrente
    this.currentProjectIndex = this.allProjects.findIndex((p: any) => p.id === id);

    const project = this.allProjects[this.currentProjectIndex] || null;
    this.project.set(project);

    // Configura SEO dinamico per il progetto specifico
    if (project) {
      this.seoService.updateSEO({
        title: `${project.title} - Portfolio De Luca Costruzioni`,
        description: `${project.description} - Scopri i dettagli di questo progetto realizzato da De Luca Costruzioni.`,
        keywords: `${project.title}, portfolio costruzioni, ristrutturazione, De Luca Costruzioni`,
        ogTitle: `${project.title} - Portfolio`,
        ogDescription: project.description,
        ogImage: project.cover_img || '/assets/images/logo_transparent.svg',
        ogUrl: `https://delucacostruzioni.it/portfolio/${project.id}`,
        structuredData: this.seoService.createProjectStructuredData({
          title: project.title,
          description: project.description,
          image: project.cover_img,
          date: project.created_at,
          tags: project.categories || []
        })
      });
    }

    // ensure swipers are re-initialized for the new content
    setTimeout(() => {
      // destroy previous instances to avoid duplicates
      try { this.swiper?.destroy(); } catch { }
      try { this.thumbsSwiper?.destroy(); } catch { }
      try { this.fullscreenSwiper?.destroy(); } catch { }

      this.initSwiper();
      this.initFullscreenSwipers();
      // preload images for immediate display
      this.preloadImages();
    }, 100);
  }

  getCoverImage(beforeImages: ImageData[], afterImages: ImageData[]): ImageData | null {
    if (!beforeImages || !afterImages) return null;
    if (afterImages.length > 0) {
      const coverAfter = afterImages.find((img: ImageData) => img.isCoverImg);
      if (coverAfter) return coverAfter;
    } else {
      if (beforeImages.length > 0) {
        const coverBefore = beforeImages.find((img: ImageData) => img.isCoverImg);
        if (coverBefore) return coverBefore;
      }
    };
    return null
  }

  initSwiper(): void {
    this.swiper = new Swiper('.portfolio-detail-swiper', {
      modules: [Pagination],
      slidesPerView: 1.1,
      spaceBetween: 20,
      centeredSlides: false,
      pagination: {
        el: '.portfolio-detail-swiper .portfolio-detail-pagination',
        clickable: true,
        dynamicBullets: false,
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        1024: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
      },
    });
  }

  initFullscreenSwipers(): void {
    // distruggi se già inizializzati
    try {
      this.thumbsSwiper?.destroy();
    } catch { }
    try {
      this.fullscreenSwiper?.destroy();
    } catch { }

    // inizializza thumbs first
    this.thumbsSwiper = new Swiper('.portfolio-fullscreen-thumbs', {
      slidesPerView: 6,
      spaceBetween: 4,
      watchSlidesProgress: true,
      freeMode: true,
      breakpoints: {
        480: { slidesPerView: 4, spaceBetween: 4 },
        768: { slidesPerView: 8, spaceBetween: 4 },
      },
    });

    // main fullscreen swiper
    this.fullscreenSwiper = new Swiper('.portfolio-fullscreen-swiper', {
      modules: [Navigation, Pagination, Thumbs],
      loop: false,
      spaceBetween: 20,
      navigation: {
        nextEl: '.portfolio-fullscreen-button-next',
        prevEl: '.portfolio-fullscreen-button-prev',
      },
      pagination: {
        el: '.portfolio-fullscreen-pagination',
        clickable: true,
      },
      thumbs: {
        swiper: this.thumbsSwiper as any,
      },
    });

    // click thumb -> go
    // (Swiper handles this automatically when thumbs.swiper is provided)
  }

  openFullscreenByUrl(url: string): void {
    const immagini = this.project()?.immagini;
    if (!immagini) return;

    // Determina in quale categoria si trova l'immagine
    let category: 'beforeImages' | 'afterImages' | null = null;
    let idx = -1;

    const beforeIdx = (immagini.beforeImages ?? []).findIndex((i: any) => i.url === url);
    if (beforeIdx >= 0) {
      category = 'beforeImages';
      idx = beforeIdx;
    } else {
      const afterIdx = (immagini.afterImages ?? []).findIndex((i: any) => i.url === url);
      if (afterIdx >= 0) {
        category = 'afterImages';
        idx = afterIdx;
      }
    }

    if (!category) return; // Immagine non trovata

    this._fullscreenCategory.set(category);
    this.fullscreenOpen = true;

    // blocca lo scroll del body e mantiene la posizione corrente
    try {
      this._prevBodyOverflow = document.body.style.overflow;
      this._prevBodyPosition = document.body.style.position;
      this._prevBodyTop = document.body.style.top;
      this._prevBodyLeft = document.body.style.left;
      this._scrollY = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this._scrollY}px`;
      document.body.style.left = '0';
      document.body.style.overflow = 'hidden';
      // nascondi la navbar direttamente via DOM
      this._navbarEl = document.querySelector('.navbar') as HTMLElement;
      if (this._navbarEl) {
        this._prevNavbarDisplay = this._navbarEl.style.display;
        this._navbarEl.style.display = 'none';
      }
    } catch (e) {
      // ignore in environments without DOM
    }

    // attendi che il DOM mostri l'overlay e gli swiper siano pronti
    setTimeout(() => {
      // Forza Angular a renderizzare il template con la nuova categoria
      this.cdr.detectChanges();

      if (!this.fullscreenSwiper || !this.thumbsSwiper) {
        this.initFullscreenSwipers();
      }

      // Aggiorna swiper per ricontare i nuovi slide (categoria cambiata)
      this.thumbsSwiper?.update();
      this.fullscreenSwiper?.update();

      const targetIndex = idx >= 0 ? idx : 0;
      // slideTo usa indice dello slide (non loop), usiamo 0-based
      this.fullscreenSwiper?.slideTo(targetIndex, 0);
    }, 50);
  }

  onOverlayClick(event: Event): void {
    // chiudi solo se si clicca sullo sfondo dell'overlay (non sulle immagini/thumbs)
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('portfolio-fullscreen-overlay')) {
      this.closeFullscreen();
    }
  }

  closeFullscreen(): void {
    this.fullscreenOpen = false;
    this._fullscreenCategory.set(null);
    // ripristina lo scroll del body e la posizione salvata
    try {
      document.body.style.overflow = this._prevBodyOverflow ?? '';
      document.body.style.position = this._prevBodyPosition ?? '';
      document.body.style.top = this._prevBodyTop ?? '';
      document.body.style.left = this._prevBodyLeft ?? '';
      // riposiziona la pagina dove era prima di aprire il fullscreen
      if (this._scrollY) {
        window.scrollTo(0, this._scrollY);
      }
      // ripristina la navbar
      if (this._navbarEl) {
        this._navbarEl.style.display = this._prevNavbarDisplay ?? '';
      }
    } catch (e) {
      // ignore
    }
  }

  ngOnDestroy(): void {
    try {
      if (this.swiper && typeof (this.swiper as any).destroy === 'function') {
        (this.swiper as any).destroy();
      }
    } catch (e) { }
    try {
      if (this.fullscreenSwiper && typeof (this.fullscreenSwiper as any).destroy === 'function') {
        (this.fullscreenSwiper as any).destroy();
      }
    } catch (e) { }
    try {
      if (this.thumbsSwiper && typeof (this.thumbsSwiper as any).destroy === 'function') {
        (this.thumbsSwiper as any).destroy();
      }
    } catch (e) { }

    // Cleanup cache
    this.projectsCache.clear();

    window.removeEventListener('keydown', this._onKeyDown);
    this._routeSub?.unsubscribe();
    // ripristina body se qualcosa è rimasto
    try {
      document.body.style.overflow = this._prevBodyOverflow ?? '';
      document.body.style.position = this._prevBodyPosition ?? '';
      document.body.style.top = this._prevBodyTop ?? '';
      document.body.style.left = this._prevBodyLeft ?? '';
      if (this._scrollY) window.scrollTo(0, this._scrollY);
      if (this._navbarEl) {
        this._navbarEl.style.display = this._prevNavbarDisplay ?? '';
      }
    } catch (e) { }
  }

  /** Preload immagini per migliorare percezione di caricamento */
  preloadImages(): void {
    try {
      // Precarica immagini da entrambe le categorie
      const immagini = this.project()?.immagini;
      if (!immagini) return;

      const allImages = [
        ...(immagini.beforeImages ?? []),
        ...(immagini.afterImages ?? [])
      ];

      const limit = Math.min(20, allImages.length);
      for (let i = 0; i < limit; i++) {
        const url = allImages[i]?.url;
        if (url) {
          const img = new Image();
          img.src = url;
        }
      }

      const cover = this.project()?.cover_img;
      if (cover) {
        const c = new Image();
        c.src = cover;
      }
    } catch (e) {
      // ignore
    }
  }
}
