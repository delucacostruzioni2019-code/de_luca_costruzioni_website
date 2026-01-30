import { Injectable, inject, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  author?: string;
  robots?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: any;
}

interface BusinessInfo {
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  website: string;
  logo: string;
  image: string;
  openingHours: string[];
  services: string[];
  foundingDate: string;
  priceRange: string;
}

@Injectable({
  providedIn: 'root'
})
export class SEOService {
  private meta = inject(Meta);
  private title = inject(Title);
  private router = inject(Router);
  private document = inject(DOCUMENT);

  private readonly businessInfo: BusinessInfo = {
    name: 'De Luca Costruzioni',
    description: 'Azienda leader nel settore delle costruzioni e ristrutturazioni. Offriamo servizi di alta qualità per costruzioni civili, industriali e ristrutturazioni complete.',
    address: {
      street: 'Via Napoli 141', // TODO: Aggiornare con indirizzo reale
      city: 'Casanuovo', // TODO: Aggiornare con città reale
      region: 'Campania',
      postalCode: '80013',
      country: 'Italia'
    },
    phone: '+39 338 924 1314', // TODO: Aggiornare con numero reale
    email: 'delucacostruzioni2019@gmail.com', // TODO: Aggiornare con email reale
    website: 'https://delucacostruzioni.it', // TODO: Aggiornare con dominio reale
    logo: '/assets/images/logo_transparent.svg',
    image: '/assets/images/hero-bg.jpg', // TODO: Aggiornare con immagine principale
    openingHours: [
      'Mo-Fr 08:00-18:00',
      'Sa 08:00-13:00'
    ],
    services: [
      'Costruzioni civili',
      'Costruzioni industriali',
      'Ristrutturazioni complete',
      'Restauro edifici storici',
      'Consulenza tecnica',
      'Progettazione edilizia'
    ],
    foundingDate: '1985-01-01', // TODO: Aggiornare con data reale
    priceRange: '€€€'
  };

  constructor() {
    // Ascolta i cambiamenti di route per aggiornare SEO
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => event as NavigationEnd)
    ).subscribe(event => {
      this.updateCanonicalUrl(event.urlAfterRedirects);
    });
  }

  /**
   * Configura SEO per una pagina specifica
   */
  updateSEO(config: SEOConfig): void {
    // Title
    this.title.setTitle(config.title);

    // Meta Description
    this.meta.updateTag({ name: 'description', content: config.description });

    // Keywords
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    // Author
    if (config.author) {
      this.meta.updateTag({ name: 'author', content: config.author });
    }

    // Robots
    if (config.robots) {
      this.meta.updateTag({ name: 'robots', content: config.robots });
    }

    // Canonical URL
    if (config.canonical) {
      this.updateCanonicalUrl(config.canonical);
    }

    // Open Graph
    this.updateOpenGraph(config);

    // Twitter Cards
    this.updateTwitterCards(config);

    // Structured Data
    if (config.structuredData) {
      this.updateStructuredData(config.structuredData);
    }
  }

  /**
   * Aggiorna Open Graph meta tags
   */
  private updateOpenGraph(config: SEOConfig): void {
    const ogConfig: { [key: string]: string } = {
      'og:title': config.ogTitle || config.title,
      'og:description': config.ogDescription || config.description,
      'og:type': config.ogType || 'website',
      'og:url': config.ogUrl || this.getCurrentUrl(),
      'og:site_name': this.businessInfo.name,
      'og:locale': 'it_IT'
    };

    if (config.ogImage) {
      ogConfig['og:image'] = this.getAbsoluteUrl(config.ogImage);
      ogConfig['og:image:alt'] = config.ogTitle || config.title;
    }

    Object.entries(ogConfig).forEach(([property, content]) => {
      this.meta.updateTag({ property, content });
    });
  }

  /**
   * Aggiorna Twitter Cards meta tags
   */
  private updateTwitterCards(config: SEOConfig): void {
    const twitterConfig: { [key: string]: string } = {
      'twitter:card': config.twitterCard || 'summary_large_image',
      'twitter:title': config.twitterTitle || config.title,
      'twitter:description': config.twitterDescription || config.description
    };

    if (config.twitterImage || config.ogImage) {
      twitterConfig['twitter:image'] = this.getAbsoluteUrl(config.twitterImage || config.ogImage!);
    }

    Object.entries(twitterConfig).forEach(([name, content]) => {
      this.meta.updateTag({ name, content });
    });
  }

  /**
   * Aggiorna l'URL canonico
   */
  private updateCanonicalUrl(url: string): void {
    // Rimuovi canonical link esistente
    const existing = this.document.querySelector('link[rel="canonical"]');
    if (existing) {
      existing.remove();
    }

    // Aggiungi nuovo canonical link
    const link = this.document.createElement('link');
    link.rel = 'canonical';
    link.href = this.getAbsoluteUrl(url);
    this.document.head.appendChild(link);
  }

  /**
   * Aggiorna structured data (JSON-LD)
   */
  updateStructuredData(data: any): void {
    // Rimuovi script esistente
    const existing = this.document.querySelector('script[type="application/ld+json"]');
    if (existing) {
      existing.remove();
    }

    // Aggiungi nuovo script
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  /**
   * Crea structured data per la homepage
   */
  createBusinessStructuredData(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'ConstructionBusiness',
      'name': this.businessInfo.name,
      'description': this.businessInfo.description,
      'url': this.businessInfo.website,
      'logo': this.getAbsoluteUrl(this.businessInfo.logo),
      'image': this.getAbsoluteUrl(this.businessInfo.image),
      'telephone': this.businessInfo.phone,
      'email': this.businessInfo.email,
      'foundingDate': this.businessInfo.foundingDate,
      'priceRange': this.businessInfo.priceRange,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': this.businessInfo.address.street,
        'addressLocality': this.businessInfo.address.city,
        'addressRegion': this.businessInfo.address.region,
        'postalCode': this.businessInfo.address.postalCode,
        'addressCountry': this.businessInfo.address.country
      },
      'openingHoursSpecification': this.businessInfo.openingHours.map(hours => {
        const [days, time] = hours.split(' ');
        const [opens, closes] = time.split('-');
        
        return {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': this.convertDayFormat(days),
          'opens': opens,
          'closes': closes
        };
      }),
      'hasOfferCatalog': {
        '@type': 'OfferCatalog',
        'name': 'Servizi di Costruzione',
        'itemListElement': this.businessInfo.services.map((service) => ({
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            'name': service
          }
        }))
      },
      'areaServed': {
        '@type': 'Country',
        'name': 'Italy'
      },
      'sameAs': [
        // TODO: Aggiungere profili social media reali
        'https://www.facebook.com/delucacostruzioni',
        'https://www.instagram.com/delucacostruzioni',
        'https://www.linkedin.com/company/delucacostruzioni'
      ]
    };
  }

  /**
   * Crea structured data per un progetto/portfolio
   */
  createProjectStructuredData(project: any): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      'name': project.title,
      'description': project.description,
      'image': this.getAbsoluteUrl(project.image),
      'creator': {
        '@type': 'Organization',
        'name': this.businessInfo.name,
        'url': this.businessInfo.website
      },
      'dateCreated': project.date,
      'genre': 'Construction Project',
      'keywords': project.tags?.join(', ')
    };
  }

  /**
   * Crea structured data per un articolo/blog post
   */
  createArticleStructuredData(article: any): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': article.title,
      'description': article.description,
      'image': this.getAbsoluteUrl(article.image),
      'datePublished': article.publishedDate,
      'dateModified': article.modifiedDate || article.publishedDate,
      'author': {
        '@type': 'Organization',
        'name': this.businessInfo.name,
        'url': this.businessInfo.website
      },
      'publisher': {
        '@type': 'Organization',
        'name': this.businessInfo.name,
        'logo': {
          '@type': 'ImageObject',
          'url': this.getAbsoluteUrl(this.businessInfo.logo)
        },
        'url': this.businessInfo.website
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': this.getCurrentUrl()
      }
    };
  }

  /**
   * Configurazioni SEO predefinite per le pagine
   */
  getPageSEOConfig(pageName: string): SEOConfig {
    const baseUrl = this.businessInfo.website;
    const baseImage = '/assets/images/logo_transparent.svg';

    const configs: { [key: string]: SEOConfig } = {
      home: {
        title: `${this.businessInfo.name} - Costruzioni e Ristrutturazioni di Qualità`,
        description: `${this.businessInfo.description} Contattaci per un preventivo gratuito.`,
        keywords: 'costruzioni, ristrutturazioni, edilizia, impresa costruzioni, lavori edili, Roma, Lazio',
        ogTitle: `${this.businessInfo.name} - Leader nelle Costruzioni`,
        ogDescription: 'Scopri i nostri servizi di costruzione e ristrutturazione. Qualità garantita e preventivi gratuiti.',
        ogImage: baseImage,
        ogType: 'website',
        ogUrl: baseUrl,
        structuredData: this.createBusinessStructuredData()
      },
      
      chi_siamo: {
        title: `Chi Siamo - ${this.businessInfo.name}`,
        description: `Scopri la storia e i valori di ${this.businessInfo.name}. Anni di esperienza nel settore delle costruzioni e ristrutturazioni.`,
        keywords: 'chi siamo, storia azienda, esperienza costruzioni, valori aziendali',
        ogTitle: `La Storia di ${this.businessInfo.name}`,
        ogDescription: 'Anni di esperienza e professionalità nel settore delle costruzioni.',
        ogImage: baseImage,
        ogUrl: `${baseUrl}/chi-siamo`
      },

      servizi: {
        title: `Servizi - ${this.businessInfo.name}`,
        description: `I nostri servizi: ${this.businessInfo.services.join(', ')}. Qualità e professionalità garantite.`,
        keywords: 'servizi costruzioni, ristrutturazioni, edilizia civile, edilizia industriale, restauro',
        ogTitle: `Servizi di Costruzione - ${this.businessInfo.name}`,
        ogDescription: 'Offriamo una gamma completa di servizi nel settore delle costruzioni.',
        ogImage: baseImage,
        ogUrl: `${baseUrl}/servizi`
      },

      portfolio: {
        title: `Portfolio Progetti - ${this.businessInfo.name}`,
        description: `Esplora i nostri progetti completati. Esempi di costruzioni e ristrutturazioni realizzate da ${this.businessInfo.name}.`,
        keywords: 'portfolio progetti, lavori completati, esempi costruzioni, case ristrutturate',
        ogTitle: `Portfolio Progetti - ${this.businessInfo.name}`,
        ogDescription: 'Scopri i progetti che abbiamo realizzato con successo.',
        ogImage: baseImage,
        ogUrl: `${baseUrl}/portfolio`
      },

      contatti: {
        title: `Contatti - ${this.businessInfo.name}`,
        description: `Contatta ${this.businessInfo.name} per preventivi gratuiti. ${this.businessInfo.phone} - ${this.businessInfo.email}`,
        keywords: 'contatti, preventivo gratuito, telefono, email, indirizzo',
        ogTitle: `Contatta ${this.businessInfo.name}`,
        ogDescription: 'Richiedi un preventivo gratuito per il tuo progetto.',
        ogImage: baseImage,
        ogUrl: `${baseUrl}/contatti`
      }
    };

    return configs[pageName] || configs['home'];
  }

  /**
   * Metodi helper privati
   */
  private getCurrentUrl(): string {
    return `${this.businessInfo.website}${this.router.url}`;
  }

  private getAbsoluteUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    return `${this.businessInfo.website}${path.startsWith('/') ? path : '/' + path}`;
  }

  private convertDayFormat(days: string): string[] {
    const dayMap: { [key: string]: string } = {
      'Mo': 'Monday',
      'Tu': 'Tuesday', 
      'We': 'Wednesday',
      'Th': 'Thursday',
      'Fr': 'Friday',
      'Sa': 'Saturday',
      'Su': 'Sunday'
    };

    if (days.includes('-')) {
      const [start, end] = days.split('-');
      const startIndex = Object.keys(dayMap).indexOf(start);
      const endIndex = Object.keys(dayMap).indexOf(end);
      
      return Object.keys(dayMap)
        .slice(startIndex, endIndex + 1)
        .map(key => dayMap[key]);
    }

    return [dayMap[days]];
  }

  /**
   * Metodi pubblici per aggiornamenti specifici
   */
  updatePageSEO(pageName: string): void {
    const config = this.getPageSEOConfig(pageName);
    this.updateSEO(config);
  }

  setLanguage(lang: string): void {
    this.meta.updateTag({ name: 'language', content: lang });
    this.meta.updateTag({ property: 'og:locale', content: lang === 'it' ? 'it_IT' : 'en_US' });
    this.document.documentElement.lang = lang;
  }
}