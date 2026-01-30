import { Injectable } from '@angular/core';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SitemapService {
  private readonly baseUrl = 'https://delucacostruzioni.com'; // TODO: Aggiornare con il dominio reale

  /**
   * Genera il contenuto XML della sitemap
   */
  generateSitemap(): string {
    const urls: SitemapUrl[] = [
      {
        loc: this.baseUrl,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 1.0
      },
      {
        loc: `${this.baseUrl}/chi-siamo`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.8
      },
      {
        loc: `${this.baseUrl}/servizi`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.9
      },
      {
        loc: `${this.baseUrl}/portfolio`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        loc: `${this.baseUrl}/contatti`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.7
      }
      // TODO: Aggiungere altri URL dinamici se necessario
    ];

    return this.generateSitemapXML(urls);
  }

  /**
   * Genera XML della sitemap
   */
  private generateSitemapXML(urls: SitemapUrl[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    urls.forEach(url => {
      xml += '  <url>\n';
      xml += `    <loc>${url.loc}</loc>\n`;
      
      if (url.lastmod) {
        xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      }
      
      if (url.changefreq) {
        xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      }
      
      if (url.priority !== undefined) {
        xml += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
      }
      
      xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
  }

  /**
   * Salva la sitemap come file (per build process)
   */
  saveSitemap(): void {
    const sitemapContent = this.generateSitemap();
    console.log('Sitemap generata:');
    console.log(sitemapContent);
    
    // In un environment Node.js, salveresti il file:
    // import { writeFileSync } from 'fs';
    // writeFileSync('public/sitemap.xml', sitemapContent, 'utf8');
  }
}