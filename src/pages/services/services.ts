import { Component, OnInit, inject } from '@angular/core';
import { HeroBanner } from '../../components/hero-banner/hero-banner';
import { HowWeWork } from "../../components/how-we-work/how-we-work";
import { BannerCta } from "../../components/banner-cta/banner-cta";
import { AdditionalServices } from "../../components/additional-services/additional-services";
import { SEOService } from '../../services/seo.service';

@Component({
  selector: 'app-services',
  standalone: true,
  templateUrl: './services.html',
  styleUrl: './services.scss',
  imports: [HeroBanner, HowWeWork, BannerCta, AdditionalServices],
})
export default class Services implements OnInit {
  private seoService = inject(SEOService);

  ngOnInit(): void {
    // Configura SEO per pagina servizi
    this.seoService.updatePageSEO('servizi');
  }
}
