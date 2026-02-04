import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface GoogleReview {
  author_name: string;
  author_url?: string;
  language?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface GooglePlaceDetails {
  place_id: string;
  name: string;
  rating: number;
  user_ratings_total: number;
  reviews: GoogleReview[];
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
}

export interface GooglePlacesResponse {
  result: GooglePlaceDetails;
  status: string;
}

interface CachedReviews {
  data: GooglePlaceDetails;
  timestamp: number;
  expiry: number;
}

interface EdgeFunctionResponse {
  success: boolean;
  data?: GooglePlaceDetails;
  error?: string;
  fallback_data?: GooglePlaceDetails;
}

@Injectable({
  providedIn: 'root'
})
export class GooglePlacesService {
  private http = inject(HttpClient);
  private readonly CACHE_KEY = 'google_reviews_cache';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 ore in millisecondi

  private readonly SUPABASE_URL = environment.supabaseUrl;
  private readonly EDGE_FUNCTION_URL = `${this.SUPABASE_URL}/functions/v1/get-google-reviews`;

  /**
   * Ottiene le recensioni di Google Places con cache locale di 24h
   */
  getPlaceReviews(): Observable<GooglePlaceDetails> {
    // Controlla prima la cache
    const cachedData = this.getCachedReviews();
    if (cachedData && this.isCacheValid(cachedData)) {
      console.log('📦 Caricamento recensioni dalla cache locale');
      return of(cachedData.data);
    }

    // Se la cache è scaduta o non esiste, fai la chiamata alla edge function
    console.log('🌐 Caricamento recensioni da Supabase Edge Function');
    return this.fetchFromEdgeFunction().pipe(
      tap(data => this.setCachedReviews(data)),
      catchError(error => {
        console.error('❌ Errore nel caricamento dalle edge function:', error);
        
        // Se c'è un errore e abbiamo dati in cache (anche scaduti), usali
        if (cachedData) {
          console.log('⚠️ Fallback su cache scaduta');
          return of(cachedData.data);
        }
        
        // Altrimenti ritorna dati mock
        return of(this.getMockReviews());
      })
    );
  }

  /**
   * Effettua la chiamata alla Supabase Edge Function
   */
  private fetchFromEdgeFunction(): Observable<GooglePlaceDetails> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.supabaseAnonKey}`
    };

    return this.http.get<EdgeFunctionResponse>(this.EDGE_FUNCTION_URL, { headers }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        
        // Se la chiamata fallisce ma abbiamo dati di fallback
        if (response.fallback_data) {
          console.warn('⚠️ Utilizzo dati di fallback dalla edge function');
          return response.fallback_data;
        }
        
        throw new Error(`Edge Function Error: ${response.error || 'Unknown error'}`);
      })
    );
  }

  /**
   * Ottiene i dati dalla cache locale
   */
  private getCachedReviews(): CachedReviews | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      return JSON.parse(cached) as CachedReviews;
    } catch (error) {
      console.error('❌ Errore nel parsing della cache:', error);
      this.clearCache();
      return null;
    }
  }

  /**
   * Salva i dati nella cache locale
   */
  private setCachedReviews(data: GooglePlaceDetails): void {
    try {
      const now = Date.now();
      const cachedData: CachedReviews = {
        data,
        timestamp: now,
        expiry: now + this.CACHE_DURATION
      };

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cachedData));
      console.log('💾 Recensioni salvate nella cache locale');
    } catch (error) {
      console.error('❌ Errore nel salvataggio in cache:', error);
    }
  }

  /**
   * Verifica se la cache è ancora valida
   */
  private isCacheValid(cached: CachedReviews): boolean {
    const now = Date.now();
    const isValid = now < cached.expiry;
    
    if (!isValid) {
      console.log('⏰ Cache scaduta, verrà aggiornata');
      this.clearCache();
    }
    
    return isValid;
  }

  /**
   * Pulisce la cache locale
   */
  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    console.log('🗑️ Cache Google Reviews pulita');
  }

  /**
   * Forza l'aggiornamento della cache
   */
  refreshReviews(): Observable<GooglePlaceDetails> {
    this.clearCache();
    return this.getPlaceReviews();
  }

  /**
   * Ottiene informazioni sulla cache
   */
  getCacheInfo(): { exists: boolean; timestamp?: number; expiry?: number; timeUntilExpiry?: number } {
    const cached = this.getCachedReviews();
    if (!cached) {
      return { exists: false };
    }

    const now = Date.now();
    return {
      exists: true,
      timestamp: cached.timestamp,
      expiry: cached.expiry,
      timeUntilExpiry: Math.max(0, cached.expiry - now)
    };
  }

  /**
   * Converte una recensione Google nel formato del componente
   */
  convertGoogleReviewToLocal(googleReview: GoogleReview, index: number): any {
    return {
      id: index + 1,
      author: googleReview.author_name,
      date: googleReview.relative_time_description,
      rating: googleReview.rating,
      text: googleReview.text,
      avatar: googleReview.profile_photo_url,
      profile_photo_url: googleReview.profile_photo_url,
      initials: this.getInitials(googleReview.author_name)
    };
  }

  /**
   * Ottiene le iniziali da un nome
   */
  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Fornisce dati mock in caso di errore
   */
  private getMockReviews(): GooglePlaceDetails {
    return {
      place_id: 'mock_place_id',
      name: 'De Luca Costruzioni',
      rating: 5.0,
      user_ratings_total: 38,
      reviews: [
        {
          author_name: 'Daniele Pingue',
          rating: 5,
          relative_time_description: '6 mesi fa',
          text: 'Professionalità e disponibilità sono gli aggettivi per definire al meglio questa esperienza. Eccellenti in tutto, soprattutto nel rispetto dei tempi previsti che non è mai semplice in fase di ristrutturazione.',
          time: Date.now() - (6 * 30 * 24 * 60 * 60 * 1000) // 6 mesi fa
        },
        {
          author_name: 'Marco Rossi',
          rating: 5,
          relative_time_description: '3 mesi fa',
          text: 'Servizio impeccabile, personale competente e sempre disponibile. Hanno superato le mie aspettative in ogni aspetto del progetto.',
          time: Date.now() - (3 * 30 * 24 * 60 * 60 * 1000) // 3 mesi fa
        },
        {
          author_name: 'Laura Bianchi',
          rating: 5,
          relative_time_description: '2 mesi fa',
          text: 'Esperienza fantastica! Consiglio vivamente questa azienda a chiunque cerchi professionalità e qualità nel servizio.',
          time: Date.now() - (2 * 30 * 24 * 60 * 60 * 1000) // 2 mesi fa
        }
      ]
    };
  }
}