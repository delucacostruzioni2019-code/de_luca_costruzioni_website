import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewEncapsulation, inject, OnDestroy } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import Swiper from 'swiper';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { GooglePlacesService, GooglePlaceDetails } from '../../services/google-places.service';
import { Subscription } from 'rxjs';

interface Review {
  id: number;
  author: string;
  date: string;
  rating: number;
  text: string;
  avatar?: string;
  initials: string;
  profile_photo_url?: string;
}

@Component({
  selector: 'app-google-reviews',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './google-reviews.html',
  styleUrls: ['./google-reviews.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GoogleReviews implements OnInit, OnDestroy {
  private googlePlacesService = inject(GooglePlacesService);
  private subscription?: Subscription;
  
  totalReviews = 0;
  averageRating = 0;
  isLoading = false;
  error: string | null = null;

  reviews: Review[] = [];

  private swiper?: Swiper;
  expandedReviews: Set<number> = new Set();

  ngOnInit(): void {
    this.loadReviews();
  }

  initSwiper(): void {
    // Calcola se la paginazione è necessaria in base al numero di recensioni
    const shouldShowPagination = this.shouldShowPagination();
    
    this.swiper = new Swiper('.reviews-swiper', {
      modules: [Autoplay, Pagination, Navigation],
      slidesPerView: 1,
      spaceBetween: 20,
      loop: false,
      centeredSlides: false,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: shouldShowPagination ? {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: false,
        hideOnClick: false,
      } : false,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        480: {
          slidesPerView: 1,
          spaceBetween: 16,
          centeredSlides: false,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 24,
          centeredSlides: false,
        },
        1024: {
          slidesPerView: 2.5,
          spaceBetween: 30,
          centeredSlides: true,
        },
        1200: {
          slidesPerView: 3,
          spaceBetween: 30,
          centeredSlides: false,
        },
        1440: {
          slidesPerView: 3,
          spaceBetween: 40,
          centeredSlides: false,
        },
      },
    });
  }

  /**
   * Determina se mostrare la paginazione in base al numero di recensioni e dimensione schermo
   */
  private shouldShowPagination(): boolean {
    const reviewsCount = this.reviews.length;
    
    // Su mobile mostra sempre se ci sono più di 1 recensioni
    if (window.innerWidth < 768) {
      return reviewsCount > 1;
    }
    
    // Su tablet mostra se ci sono più di 2 recensioni
    if (window.innerWidth < 1200) {
      return reviewsCount > 2;
    }
    
    // Su desktop mostra se ci sono più di 3 recensioni
    return reviewsCount > 3;
  }

  /**
   * Aggiorna la paginazione di Swiper in base al numero di recensioni
   */
  private updateSwiperPagination(): void {
    if (!this.swiper) return;

    const shouldShow = this.shouldShowPagination();
    const paginationEl = document.querySelector('.swiper-pagination');
    
    if (paginationEl) {
      paginationEl.classList.toggle('hidden', !shouldShow);
    }
  }

  getStarsArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  toggleReview(reviewId: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.expandedReviews.has(reviewId)) {
      this.expandedReviews.delete(reviewId);
    } else {
      this.expandedReviews.add(reviewId);
    }

    // Aggiorna Swiper dopo l'espansione
    setTimeout(() => {
      if (this.swiper) {
        this.swiper.update();
      }
    }, 50);
  }

  isExpanded(reviewId: number): boolean {
    return this.expandedReviews.has(reviewId);
  }

  shouldShowReadMore(text: string): boolean {
    return text.length > 150;
  }

  /**
   * Carica le recensioni da Google Places API con cache locale
   */
  loadReviews(): void {
    this.isLoading = true;
    this.error = null;

    this.subscription = this.googlePlacesService.getPlaceReviews().subscribe({
      next: (placeData: GooglePlaceDetails) => {
        this.totalReviews = placeData.user_ratings_total;
        this.averageRating = placeData.rating;
        
        // Converti le recensioni Google nel formato del componente
        this.reviews = placeData.reviews.map((googleReview, index) => 
          this.googlePlacesService.convertGoogleReviewToLocal(googleReview, index)
        );

        this.isLoading = false;
        
        // Inizializza Swiper dopo il caricamento dei dati
        setTimeout(() => {
          this.initSwiper();
          this.updateSwiperPagination();
        }, 100);

        // Log informazioni cache
        const cacheInfo = this.googlePlacesService.getCacheInfo();
        if (cacheInfo.exists && cacheInfo.timeUntilExpiry) {
          const hoursLeft = Math.floor(cacheInfo.timeUntilExpiry / (1000 * 60 * 60));
          console.log(`📊 Recensioni caricate. Cache scade tra ${hoursLeft} ore`);
        }
      },
      error: (error) => {
        this.error = 'Errore nel caricamento delle recensioni';
        this.isLoading = false;
        console.error('❌ Errore caricamento recensioni:', error);
        
        // Fallback su dati mock se disponibili
        this.loadFallbackReviews();
      }
    });
  }

  /**
   * Carica recensioni di fallback in caso di errore
   */
  private loadFallbackReviews(): void {
    this.totalReviews = 38;
    this.averageRating = 5.0;
    this.reviews = [
      {
        id: 1,
        author: 'Daniele Pingue',
        date: '6 mesi fa',
        rating: 5,
        text: 'Professionalità e disponibilità sono gli aggettivi per definire al meglio questa esperienza. Eccellenti in tutto, soprattutto nel rispetto dei tempi previsti che non è mai semplice in fase di ristrutturazione.',
        initials: 'DP'
      },
      {
        id: 2,
        author: 'Marco Rossi',
        date: '3 mesi fa',
        rating: 5,
        text: 'Servizio impeccabile, personale competente e sempre disponibile. Hanno superato le mie aspettative in ogni aspetto del progetto.',
        initials: 'MR'
      },
      {
        id: 3,
        author: 'Laura Bianchi',
        date: '2 mesi fa',
        rating: 5,
        text: 'Esperienza fantastica! Consiglio vivamente questa azienda a chiunque cerchi professionalità e qualità nel servizio.',
        initials: 'LB'
      }
    ];

    setTimeout(() => {
      this.initSwiper();
      this.updateSwiperPagination();
    }, 100);
  }

  /**
   * Forza il refresh delle recensioni
   */
  refreshReviews(): void {
    this.googlePlacesService.clearCache();
    this.loadReviews();
  }

  /**
   * Ottiene informazioni sullo stato della cache
   */
  getCacheStatus(): string {
    const cacheInfo = this.googlePlacesService.getCacheInfo();
    if (!cacheInfo.exists) {
      return 'Cache vuota';
    }

    const hoursLeft = Math.floor((cacheInfo.timeUntilExpiry || 0) / (1000 * 60 * 60));
    return `Cache scade tra ${hoursLeft} ore`;
  }

  ngOnDestroy(): void {
    if (this.swiper) {
      this.swiper.destroy();
    }
    
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}