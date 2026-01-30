import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FollowOn } from "../../components/follow-on/follow-on";
import { HeroBanner } from "../../components/hero-banner/hero-banner";
import { Paginator } from "../../components/paginator/paginator";
import { RistrutturazioniService } from '../../services/ristrutturazioni';
import { SEOService } from '../../services/seo.service';

interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  categories: string[]; // Es: ['Soggiorno', 'Marmo Vero']
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss',
  imports: [HeroBanner, FollowOn, Paginator],
})
export default class Portfolio implements OnInit {

  route = inject(Router);
  ristrutturazioniService = inject(RistrutturazioniService);
  private seoService = inject(SEOService);
  ristrutturazioni = this.ristrutturazioniService.ristrutturazioni;

  categories = this.ristrutturazioniService.categories;

  // Categoria attualmente selezionata (tutte)
  selectedCategory: number | null = 0;

  // Paginazione
  currentPage = signal(1);
  itemsPerPage = 9; // 9 elementi per avere griglia 3x3 su desktop

  // Calcola gli elementi paginati
  paginatedRistrutturazioni = computed(() => {
    const allItems = this.ristrutturazioni();
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return allItems.slice(start, end);
  });


  async ngOnInit(): Promise<void> {
    // Configura SEO per pagina portfolio
    this.seoService.updatePageSEO('portfolio');
    
    this.ristrutturazioniService.getCategories();
    this.ristrutturazioniService.getRistrutturazioni();
  }

  // Metodo per filtrare i progetti
  filterProjects(categoryId: number): void {
    this.selectedCategory = categoryId;
    this.currentPage.set(1); // Reset alla prima pagina quando si filtra
    this.ristrutturazioniService.getRistrutturazioni(categoryId === 0 ? 0 : categoryId);
  }

  // Gestisce il cambio pagina
  onPageChange(page: number): void {
    this.currentPage.set(page);
    // Scroll verso l'alto per mostrare i nuovi elementi
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToDetail(project: any): void {
    // Passa l'intero oggetto progetto nello state della navigazione
    this.route.navigate(['portfolio', project.id], { state: { project } });
  }

}
