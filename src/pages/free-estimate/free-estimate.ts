import { Component, OnInit, inject } from '@angular/core';
import { ContactInfo } from "../../components/contact-info/contact-info";
import { FollowOn } from "../../components/follow-on/follow-on";
import { FormFreeEstimate } from "../../components/form-free-estimate/form-free-estimate";
import { HeroBanner } from "../../components/hero-banner/hero-banner";
import { ImgSectionHeader } from "../../components/img-section-header/img-section-header";
import { Button } from "../../components/button/button";
import { SEOService } from '../../services/seo.service';

@Component({
  selector: 'app-free-estimate',
  imports: [HeroBanner, FollowOn, FormFreeEstimate, ImgSectionHeader, ContactInfo, Button],
  templateUrl: './free-estimate.html',
  styleUrl: './free-estimate.scss',
})
export default class FreeEstimate implements OnInit {
  private seoService = inject(SEOService);

  ngOnInit(): void {
    // Configura SEO per pagina preventivo gratuito
    this.seoService.updateSEO({
      title: 'Preventivo Gratuito - De Luca Costruzioni',
      description: 'Richiedi un preventivo gratuito per il tuo progetto di costruzione o ristrutturazione. De Luca Costruzioni offre consulenze personalizzate senza impegno.',
      keywords: 'preventivo gratuito, costruzioni, ristrutturazioni, consulenza gratuita, De Luca Costruzioni, Casalnuovo, Napoli',
      ogTitle: 'Preventivo Gratuito - De Luca Costruzioni',
      ogDescription: 'Richiedi subito un preventivo gratuito per il tuo progetto. Consulenza professionale senza impegno.',
      ogImage: '/assets/images/logo_transparent.svg',
      robots: 'index, follow'
    });
  }
}
